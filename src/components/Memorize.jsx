import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Check, Mic, SkipForward, Type, Languages, AlertCircle } from 'lucide-react';
import { getCurrentPlan } from '../data/memorizationPlan';

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
    }, [user?.progress?.surah]);

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
            // Fetch verses with audio (7 = Alafasy), translation (85 = Sahih International), and transliteration (57)
            const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah}?language=en&translations=85,57&audio=7&per_page=50&fields=text_uthmani,text_imlaei_simple`);

            if (!response.ok) throw new Error('Failed to fetch verses');

            const data = await response.json();

            // Process data to extract translation and transliteration
            const processedVerses = data.verses.map(verse => {
                // Extract translation (Resource 85)
                const translationObj = verse.translations?.find(t => t.resource_id === 85);
                const translation = translationObj?.text || "Translation not available";

                // Extract transliteration (Resource 57)
                const transliterationObj = verse.translations?.find(t => t.resource_id === 57);
                // Clean up HTML tags if present (sometimes API returns <i> etc)
                const rawTransliteration = transliterationObj?.text || "";
                const transliteration = rawTransliteration.replace(/<[^>]*>/g, '');

                return {
                    ...verse,
                    audio_url: verse.audio?.url, // Correct path for audio
                    translation,
                    transliteration
                };
            });

            setVerses(processedVerses);
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

    const saveProgress = (newIndex, extraUpdates = {}) => {
        const currentSurah = user?.progress?.surah || 1;

        const plan = getCurrentPlan(currentSurah, newIndex);

        let progressPercent = 0;

        // Use the updated memorized list if provided, otherwise fall back to user prop
        const allMemorized = extraUpdates.memorized || user?.progress?.memorized || {};
        const surahMemorized = allMemorized[currentSurah] || [];

        if (plan) {
            const totalVersesInPlan = plan.endVerse - plan.startVerse + 1;
            let memorizedInPlan = 0;
            // Check how many verses in the plan are memorized
            for (let i = plan.startVerse - 1; i < plan.endVerse; i++) {
                if (surahMemorized.includes(i)) {
                    memorizedInPlan++;
                }
            }
            progressPercent = Math.round((memorizedInPlan / totalVersesInPlan) * 100);
        } else {
            // Fallback if no specific plan found (e.g. finished all plans for surah)
            progressPercent = Math.round((surahMemorized.length / verses.length) * 100);
        }

        updateUserProgress({
            verseIndex: newIndex,
            percent: progressPercent,
            ...extraUpdates
        });
    };

    const handleNext = async (extraUpdates = {}) => {
        if (currentVerseIndex < verses.length - 1) {
            const newIndex = currentVerseIndex + 1;
            setCurrentVerseIndex(newIndex);
            setIsPlaying(false);
            setFeedback('');
            // Pass extraUpdates (like new memorized verse) to saveProgress
            saveProgress(newIndex, extraUpdates);
        } else {
            // End of Surah logic
            setFeedback('Surah Completed! Masha\'Allah.');
            // Save progress even if it's the last verse to ensure completion is recorded
            saveProgress(currentVerseIndex, extraUpdates);
        }
    };

    const handlePrev = () => {
        if (currentVerseIndex > 0) {
            const newIndex = currentVerseIndex - 1;
            setCurrentVerseIndex(newIndex);
            setIsPlaying(false);
            setFeedback('');
            saveProgress(newIndex);
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

            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center', position: 'relative', overflowY: 'auto' }}>

                <div style={{ marginBottom: '30px', width: '100%' }}>
                    <h2 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Verse {currentVerseIndex + 1}</h2>

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
                        src={`https://verses.quran.com/${currentVerse.audio_url}`}
                        onEnded={() => setIsPlaying(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Memorize;
