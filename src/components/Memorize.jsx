import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Check, Mic, SkipForward, Type, Languages, AlertCircle } from 'lucide-react';
import { getCurrentPlan, SURAH_VERSE_COUNTS, SURAH_NAMES } from '../data/memorizationPlan';
import HadithFooter from './HadithFooter';

const Memorize = ({ setView, user, updateUserProgress }) => {
    const [verses, setVerses] = useState([]);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(user?.progress?.verseIndex || 0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTranslation, setShowTranslation] = useState(() => JSON.parse(localStorage.getItem('showTranslation')) ?? true);
    const [showTransliteration, setShowTransliteration] = useState(() => JSON.parse(localStorage.getItem('showTransliteration')) ?? true);
    const [reciterName, setReciterName] = useState('');
    const [translationName, setTranslationName] = useState('');

    const audioRef = useRef(null);
    const recognitionRef = useRef(null);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('showTranslation', JSON.stringify(showTranslation));
        localStorage.setItem('showTransliteration', JSON.stringify(showTransliteration));
    }, [showTranslation, showTransliteration]);

    useEffect(() => {
        fetchVerses();
        setupSpeechRecognition();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [user?.progress?.surah, user?.settings?.reciterId, user?.settings?.translationId]);

    // Sync local state with user progress when it changes (e.g. from Plan view)
    useEffect(() => {
        if (verses.length > 0) {
            // Ensure we don't go out of bounds if user progress is ahead of loaded verses
            if (user?.progress?.verseIndex < verses.length) {
                setCurrentVerseIndex(user.progress.verseIndex);
            } else if (user?.progress?.verseIndex >= verses.length && verses.length > 0) {
                // If index is beyond loaded verses, stay at last one or handle pagination (future)
                setCurrentVerseIndex(0);
            }
        }
    }, [verses, user?.progress?.verseIndex]);

    const fetchVerses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const surah = user?.progress?.surah || 1;
            let reciterId = user?.settings?.reciterId || 7; // Default to Alafasy
            const translationId = user?.settings?.translationId || 85; // Default to Sahih International

            // Handle custom reciter (Saad Al Ghamdi - ID 999)
            // We use Alafasy (7) for the API call to get text/translation, but we'll override audio URL later
            const isCustomReciter = reciterId === 999;
            if (isCustomReciter) {
                reciterId = 7;
            }

            // Fetch verses with audio, translation, and transliteration
            // Increased per_page to 300 to ensure we get all verses for even the longest Surah (Al-Baqarah: 286)
            // This prevents the issue where starting at verse > 50 resets to 0 because the verse wasn't loaded.
            const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah}?language=en&translations=${translationId},57&audio=${reciterId}&per_page=300&fields=text_uthmani,text_imlaei_simple`);

            if (!response.ok) throw new Error('Failed to fetch verses');

            const data = await response.json();

            // Process data to extract translation and transliteration
            const processedVerses = data.verses.map(verse => {
                // Extract translation (Resource ID from settings)
                const translationObj = verse.translations?.find(t => t.resource_id === translationId);
                const rawTranslation = translationObj?.text || "Translation not available";
                // Clean up HTML tags from translation (e.g. footnotes)
                const translation = rawTranslation.replace(/<[^>]*>/g, '');

                // Extract transliteration (Resource 57)
                const transliterationObj = verse.translations?.find(t => t.resource_id === 57);
                // Clean up HTML tags if present (sometimes API returns <i> etc)
                const rawTransliteration = transliterationObj?.text || "";
                const transliteration = rawTransliteration.replace(/<[^>]*>/g, '');

                let audioUrl = verse.audio?.url;
                let isFullUrl = false;

                if (isCustomReciter) {
                    // Construct EveryAyah URL: https://everyayah.com/data/Ghamadi_40kbps/SSSVVV.mp3
                    const surahPad = String(surah).padStart(3, '0');
                    const versePad = String(verse.verse_key.split(':')[1]).padStart(3, '0');
                    audioUrl = `https://everyayah.com/data/Ghamadi_40kbps/${surahPad}${versePad}.mp3`;
                    isFullUrl = true;
                }

                return {
                    ...verse,
                    audio_url: audioUrl,
                    is_full_url: isFullUrl,
                    translation,
                    transliteration
                };
            });

            setVerses(processedVerses);

            // Use names from settings if available, otherwise fallback to defaults
            setReciterName(user?.settings?.reciterName || 'Mishary Rashid Alafasy');
            setTranslationName(user?.settings?.translationName || 'Sahih International');

        } catch (err) {
            console.error("Error fetching verses:", err);
            setError('Failed to load verses. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };


    const setupSpeechRecognition = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'ar-SA';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                checkRecitation(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                setFeedback('Error listening. Please try again.');
            };

            recognitionRef.current = recognition;
        }
    };

    const checkRecitation = (transcript) => {
        // Simple length check for demonstration
        // In a real app, we'd use fuzzy string matching against verse.text_imlaei_simple
        if (transcript.length > 5) {
            setFeedback('Masha\'Allah! Good recitation.');
            // Optional: Auto-advance or mark memorized could go here
        } else {
            setFeedback('Try again. Make sure to recite clearly.');
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleListen = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setFeedback('Listening...');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const saveProgress = (newIndex, extraUpdates = {}, shouldUpdateProgress = false) => {
        const currentSurah = user?.progress?.surah || 1;

        let updates = {
            verseIndex: newIndex,
            ...extraUpdates
        };

        // Only recalculate progress if shouldUpdateProgress is true (when marking as memorized)
        if (shouldUpdateProgress) {
            const plan = getCurrentPlan(currentSurah, newIndex, user?.settings);

            // Use the updated memorized list if provided, otherwise fall back to user prop
            const allMemorized = extraUpdates.memorized || user?.progress?.memorized || {};
            const surahMemorized = allMemorized[currentSurah] || [];

            // Get today's date
            const today = new Date().toDateString();
            const lastActivityDate = user?.lastActivityDate;

            // Get verses memorized today
            let dailyMemorized = user?.progress?.dailyMemorized || [];

            // Reset daily count if it's a new day
            if (lastActivityDate !== today) {
                dailyMemorized = [];
            }

            // Add the current verse to dailyMemorized if marking as memorized
            if (extraUpdates.memorized) {
                const verseKey = `${currentSurah}-${newIndex}`;
                if (!dailyMemorized.includes(verseKey)) {
                    dailyMemorized = [...dailyMemorized, verseKey];
                }
            }

            // Calculate daily goal completion percentage
            const versesPerDay = user?.settings?.planType === 'custom'
                ? (parseInt(user?.settings?.versesPerDay) || 5)
                : Math.max(1, Math.ceil(6236 / ((parseFloat(user?.settings?.targetDuration) || 2) * 365)));

            const dailyGoalPercent = Math.min(100, Math.round((dailyMemorized.length / versesPerDay) * 100));

            // Calculate current plan segment progress
            let planProgressPercent = 0;
            if (plan) {
                const totalVersesInPlan = plan.endVerse - plan.startVerse + 1;
                let memorizedInPlan = 0;
                // Check how many verses in the plan are memorized
                for (let i = plan.startVerse - 1; i < plan.endVerse; i++) {
                    if (surahMemorized.includes(i)) {
                        memorizedInPlan++;
                    }
                }
                planProgressPercent = Math.round((memorizedInPlan / totalVersesInPlan) * 100);
            } else {
                // Fallback if no specific plan found (e.g. finished all plans for surah)
                planProgressPercent = Math.round((surahMemorized.length / verses.length) * 100);
            }

            updates.percent = dailyGoalPercent; // Use daily goal for main progress
            updates.planProgress = planProgressPercent; // Track plan segment progress separately
            updates.dailyMemorized = dailyMemorized;
        }

        updateUserProgress(updates);
    };

    const handleNext = async (extraUpdates = {}) => {
        if (currentVerseIndex < verses.length - 1) {
            const newIndex = currentVerseIndex + 1;
            setCurrentVerseIndex(newIndex);
            setIsPlaying(false);
            setFeedback('');
            // Pass extraUpdates and shouldUpdateProgress flag to saveProgress
            // Only update progress if there are extraUpdates (when marking as memorized)
            saveProgress(newIndex, extraUpdates, Object.keys(extraUpdates).length > 0);
        } else {
            // End of current verse chunk - but check if entire Surah is complete
            const currentSurah = user?.progress?.surah || 1;
            const memorizedInSurah = user?.progress?.memorized?.[currentSurah] || [];

            // Get total verses in current Surah from our static data
            const totalVersesInCurrentSurah = SURAH_VERSE_COUNTS[currentSurah] || verses.length;

            // Count how many verses are actually memorized in this Surah
            // Use the updated list if available (from markAsMemorized), otherwise use current state
            const currentMemorizedList = extraUpdates.memorized?.[currentSurah] || memorizedInSurah;
            const memorizedCount = currentMemorizedList.length;

            // Only auto-advance to next Surah if we've memorized ALL verses in current Surah
            // Otherwise, just show completion message and stay in current Surah
            if (memorizedCount >= totalVersesInCurrentSurah && currentSurah < 114) {
                setFeedback('Surah Completed! Masha\'Allah! Moving to next Surah...');
                saveProgress(currentVerseIndex, extraUpdates);

                setTimeout(() => {
                    updateUserProgress({
                        surah: currentSurah + 1,
                        verseIndex: 0,
                        surahName: `Surah ${currentSurah + 1}`
                    });
                    setCurrentVerseIndex(0);
                    setFeedback('');
                }, 2000);
            } else {
                // End of this chunk, but Surah not fully completed
                setFeedback('Great work! Continue memorizing the rest of this Surah.');
                saveProgress(currentVerseIndex, extraUpdates, Object.keys(extraUpdates).length > 0);
            }
        }
    };

    const handlePrev = () => {
        if (currentVerseIndex > 0) {
            const newIndex = currentVerseIndex - 1;
            setCurrentVerseIndex(newIndex);
            setIsPlaying(false);
            setFeedback('');
            // Don't update progress when navigating backwards
            updateUserProgress({ verseIndex: newIndex });
        }
    };

    const markAsMemorized = () => {
        const surahNumber = user?.progress?.surah || 1;
        const currentMemorized = user?.progress?.memorized || {};
        const surahMemorized = currentMemorized[surahNumber] || [];

        if (!surahMemorized.includes(currentVerseIndex)) {
            const updatedSurahMemorized = [...surahMemorized, currentVerseIndex];
            const updatedMemorized = {
                ...currentMemorized,
                [surahNumber]: updatedSurahMemorized
            };

            // Check streak
            const today = new Date().toDateString();
            const lastActivity = user?.lastActivityDate;
            const shouldIncrementStreak = lastActivity !== today;

            const updates = {
                memorized: updatedMemorized,
                streak: shouldIncrementStreak ? (user.streak || 0) + 1 : user.streak,
                lastActivityDate: today
            };

            setFeedback('Marked as memorized!');
            // Pass updates to handleNext so it can save them immediately
            handleNext(updates);
        } else {
            handleNext();
        }
    };

    if (isLoading) return <div className="flex-center" style={{ height: '100vh' }}>Loading verses...</div>;
    if (error) return <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '20px' }}><p className="text-danger">{error}</p><button className="btn-primary" onClick={fetchVerses}>Retry</button></div>;

    const currentVerse = verses[currentVerseIndex];

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft />
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        style={{ background: 'none', border: 'none', color: showTranslation ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Toggle Translation"
                    >
                        <Languages size={24} />
                    </button>
                    <button
                        onClick={() => setShowTransliteration(!showTransliteration)}
                        style={{ background: 'none', border: 'none', color: showTransliteration ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Toggle Transliteration"
                    >
                        <Type size={24} />
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: '20px', paddingBottom: '120px', textAlign: 'center', position: 'relative', overflowY: 'auto' }}>

                {/* Reciter and Translation Info */}
                {(reciterName || translationName) && (
                    <div style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(212, 175, 55, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        fontSize: '0.85rem',
                        color: 'white',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {reciterName && (
                            <div>
                                <span style={{ color: 'var(--text-muted)', marginRight: '5px' }}>Reciter:</span>
                                <span style={{ color: 'var(--primary)' }}>{reciterName}</span>
                            </div>
                        )}
                        {translationName && (
                            <div>
                                <span style={{ color: 'var(--text-muted)', marginRight: '5px' }}>Translation:</span>
                                <span style={{ color: 'var(--accent)' }}>{translationName}</span>
                            </div>
                        )}
                    </div>
                )}


                <div style={{ marginBottom: '30px', width: '100%' }}>
                    <h2 style={{ color: 'var(--accent)', marginBottom: '10px' }}>
                        {SURAH_NAMES[user?.progress?.surah || 1] || `Surah ${user?.progress?.surah || 1}`} - Verse {currentVerseIndex + 1}
                    </h2>

                    {/* Arabic Text */}
                    <p style={{
                        fontSize: '2.5rem',
                        lineHeight: '1.6',
                        marginBottom: '20px',
                        filter: isHidden ? 'blur(10px)' : 'none',
                        transition: 'filter 0.3s',
                        fontFamily: "'Amiri', serif" // Ensure Arabic font is used if available
                    }}>
                        {currentVerse?.text_uthmani}
                    </p>

                    {/* Transliteration */}
                    {showTransliteration && (
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'var(--text-muted)',
                            marginBottom: '15px',
                            fontStyle: 'italic',
                            filter: isHidden ? 'blur(5px)' : 'none',
                            transition: 'filter 0.3s'
                        }}>
                            {currentVerse?.transliteration}
                        </p>
                    )}

                    {/* Translation */}
                    {showTranslation && (
                        <p style={{
                            fontSize: '1.2rem',
                            marginBottom: '20px',
                            filter: isHidden ? 'blur(5px)' : 'none',
                            transition: 'filter 0.3s'
                        }}>
                            {currentVerse?.translation}
                        </p>
                    )}
                </div>

                {feedback && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(16, 185, 129, 0.2)',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        color: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        {feedback.includes('Try again') ? <AlertCircle size={16} /> : <Check size={16} />}
                        {feedback}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                    <button className="btn-outline" onClick={togglePlay}>
                        {isPlaying ? <Pause /> : <Play />}
                    </button>
                    <button className="btn-outline" onClick={() => setIsHidden(!isHidden)}>
                        {isHidden ? 'Show' : 'Hide'}
                    </button>
                    <button className={`btn-outline ${isListening ? 'listening' : ''}`} onClick={toggleListen} style={{ borderColor: isListening ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}>
                        <Mic color={isListening ? 'var(--accent)' : 'white'} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center' }}>
                    <button className="btn-outline" onClick={handlePrev} disabled={currentVerseIndex === 0}>
                        <RotateCcw size={20} /> Prev
                    </button>
                    <button className="btn-primary" onClick={markAsMemorized}>
                        Mark Memorized <Check size={20} style={{ marginLeft: '5px' }} />
                    </button>
                    <button className="btn-outline" onClick={() => handleNext()} disabled={currentVerseIndex === verses.length - 1}>
                        Skip <SkipForward size={20} style={{ marginLeft: '5px' }} />
                    </button>
                </div>

                {/* Audio Element */}
                {currentVerse?.audio_url && (
                    <audio
                        ref={audioRef}
                        src={currentVerse.is_full_url ? currentVerse.audio_url : `https://verses.quran.com/${currentVerse.audio_url}`}
                        onEnded={() => setIsPlaying(false)}
                    />
                )}
            </div>

            <HadithFooter />
        </div>
    );
};

export default Memorize;
