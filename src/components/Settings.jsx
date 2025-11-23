import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Settings as SettingsIcon } from 'lucide-react';
import HadithFooter from './HadithFooter';
import { SURAH_NAMES } from '../data/memorizationPlan';

const Settings = ({ setView, user, updateUser }) => {
    const [settings, setSettings] = useState(user?.settings || {
        targetDuration: 1,
        reciterId: 7,
        translationId: 85
    });

    const [reciters, setReciters] = useState([]);
    const [translations, setTranslations] = useState([]);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Reciters
                const recitersRes = await fetch('https://api.quran.com/api/v4/resources/recitations?language=en');
                const recitersData = await recitersRes.json();
                setReciters(recitersData.recitations || []);

                // Fetch Translations (English)
                const translationsRes = await fetch('https://api.quran.com/api/v4/resources/translations?language=en');
                const translationsData = await translationsRes.json();
                setTranslations(translationsData.translations || []);
            } catch (error) {
                console.error("Error fetching settings data:", error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        // Find selected names
        const selectedReciter = reciters.find(r => r.id === settings.reciterId);
        const selectedTranslation = translations.find(t => t.id === settings.translationId);

        const updatedSettings = {
            ...settings,
            reciterName: selectedReciter?.reciter_name || 'Unknown Reciter',
            translationName: selectedTranslation?.name || 'Unknown Translation',
            // Ensure targetSurah is set if custom, defaulting to 1
            targetSurah: settings.planType === 'custom' ? (settings.targetSurah || 1) : settings.targetSurah,
            // Ensure versesPerDay is a valid number
            versesPerDay: parseInt(settings.versesPerDay) || 5
        };

        const updates = { settings: updatedSettings };

        console.log("Saving settings...", updatedSettings);

        // If switching to custom plan, ensure we start at the correct Surah
        if (updatedSettings.planType === 'custom') {
            const targetSurah = parseInt(updatedSettings.targetSurah);
            const currentSurah = user?.progress?.surah || 1;

            console.log(`Custom Plan Check: Target=${targetSurah}, Current=${currentSurah}`);

            // Always update if the target is different, OR if we are switching to custom for the first time
            // to ensure UI reflects it immediately.
            if (!isNaN(targetSurah) && targetSurah !== currentSurah) {
                console.log("Updating progress to new Surah:", targetSurah);
                updates.surah = targetSurah;
                updates.verseIndex = 0;
                updates.surahName = SURAH_NAMES[targetSurah];
            }
        }

        await updateUser(updates);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            setView('home');
        }, 1000);
    };

    const optionStyle = { color: 'black' };

    return (
        <div className="container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button
                    onClick={() => setView('home')}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginRight: '15px' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SettingsIcon size={24} /> Settings
                </h2>
            </div>

            <div className="glass-panel" style={{ padding: '25px' }}>

                {/* Current Settings Display */}
                {(user?.settings?.reciterName || user?.settings?.translationName) && (
                    <div style={{
                        marginBottom: '30px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            color: 'white',
                            marginBottom: '12px',
                            fontWeight: '600'
                        }}>
                            Currently Selected
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {user?.settings?.reciterName && (
                                <div style={{ fontSize: '0.9rem', color: 'white' }}>
                                    <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Reciter:</span>
                                    <span style={{ color: 'var(--primary)' }}>{user.settings.reciterName}</span>
                                </div>
                            )}
                            {user?.settings?.translationName && (
                                <div style={{ fontSize: '0.9rem', color: 'white' }}>
                                    <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Translation:</span>
                                    <span style={{ color: 'var(--accent)' }}>{user.settings.translationName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Plan Type Selection */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)' }}>
                        Memorization Plan Type
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <button
                            onClick={() => handleChange('planType', 'duration')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: settings.planType !== 'custom' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: settings.planType !== 'custom' ? 'black' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Duration Based
                        </button>
                        <button
                            onClick={() => handleChange('planType', 'custom')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: settings.planType === 'custom' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: settings.planType === 'custom' ? 'black' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Custom Plan
                        </button>
                    </div>

                    {settings.planType === 'custom' ? (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Start from Surah
                                </label>
                                <select
                                    value={settings.targetSurah || 1}
                                    onChange={(e) => handleChange('targetSurah', Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                >
                                    {Object.entries(SURAH_NAMES).map(([id, name]) => (
                                        <option key={id} value={id} style={{ color: 'black' }}>
                                            {id}. {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Verses per Day
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="286"
                                    value={settings.versesPerDay === undefined || settings.versesPerDay === null ? 5 : settings.versesPerDay}
                                    onChange={(e) => handleChange('versesPerDay', e.target.value === '' ? '' : e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)' }}>
                                Target Duration
                            </label>
                            <select
                                value={settings.targetDuration}
                                onChange={(e) => handleChange('targetDuration', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            >
                                <option style={{ color: 'black' }} value={0.25}>3 Months</option>
                                <option style={{ color: 'black' }} value={0.5}>6 Months</option>
                                <option style={{ color: 'black' }} value={0.75}>9 Months</option>
                                <option style={{ color: 'black' }} value={1}>1 Year</option>
                                <option style={{ color: 'black' }} value={1.5}>1.5 Years</option>
                                <option style={{ color: 'black' }} value={2}>2 Years</option>
                                <option style={{ color: 'black' }} value={3}>3 Years</option>
                                <option style={{ color: 'black' }} value={5}>5 Years</option>
                            </select>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                Adjusts the pace of your daily memorization plan.
                            </p>
                        </div>
                    )}
                </div>

                {/* Reciter Selection */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)' }}>
                        Preferred Reciter
                    </label>
                    <select
                        value={settings.reciterId}
                        onChange={(e) => handleChange('reciterId', Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    >
                        {reciters.length > 0 ? (
                            reciters.map(reciter => (
                                <option key={reciter.id} style={optionStyle} value={reciter.id}>
                                    {reciter.reciter_name} {reciter.style ? `(${reciter.style})` : ''}
                                </option>
                            ))
                        ) : (
                            <>
                                <option style={optionStyle} value={7}>Mishary Rashid Alafasy</option>
                                <option style={optionStyle} value={2}>AbdulBaset AbdulSamad</option>
                            </>
                        )}
                    </select>
                </div>

                {/* Translation Selection */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)' }}>
                        Translation Language
                    </label>
                    <select
                        value={settings.translationId}
                        onChange={(e) => handleChange('translationId', Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    >
                        {translations.length > 0 ? (
                            translations.map(translation => (
                                <option key={translation.id} style={optionStyle} value={translation.id}>
                                    {translation.name} ({translation.language_name})
                                </option>
                            ))
                        ) : (
                            <>
                                <option style={optionStyle} value={85}>Sahih International (English)</option>
                                <option style={optionStyle} value={131}>The Clear Quran (English)</option>
                            </>
                        )}
                    </select>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleSave}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                >
                    <Save size={20} /> Save Settings
                </button>
            </div>

            {showToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--accent)',
                    color: 'black',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    Settings Saved!
                </div>
            )}

            <HadithFooter />
        </div>
    );
};

export default Settings;
