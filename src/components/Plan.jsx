import React from 'react';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { generatePlan } from '../data/memorizationPlan';
import HadithFooter from './HadithFooter';

const Plan = ({ user, setView, updateUserProgress }) => {
    const planDaysList = generatePlan(user?.settings);

    const getStatus = (planItem, index, allDays) => {
        const userSurah = user?.progress?.surah || 1;
        const userVerseIndex = user?.progress?.verseIndex || 0;
        const memorized = user?.progress?.memorized?.[planItem.surah] || [];

        // Count how many verses in this plan are memorized
        let memorizedCount = 0;
        for (let i = planItem.startVerse - 1; i < planItem.endVerse; i++) {
            if (memorized.includes(i)) {
                memorizedCount++;
            }
        }

        const totalVersesInPlan = planItem.endVerse - planItem.startVerse + 1;

        // Completed: All verses in this day's plan are memorized
        if (memorizedCount === totalVersesInPlan) {
            return 'completed';
        }

        // Current: User is currently on this surah and within or past this verse range
        if (userSurah === planItem.surah) {
            const currentVerse = userVerseIndex + 1;
            // If user has passed the start of this range, it's current
            if (currentVerse >= planItem.startVerse && currentVerse <= planItem.endVerse) {
                return 'current';
            }
            // If user is past this range but not all memorized, still mark as current
            if (currentVerse > planItem.endVerse && memorizedCount > 0) {
                return 'current';
            }
        }

        // If user is on a later surah, previous ones should be completed or current
        if (userSurah > planItem.surah) {
            // If not fully memorized but user has moved on, mark as current
            return 'current';
        }

        // Check if previous day is completed
        if (index > 0) {
            const prevDay = allDays[index - 1];
            const prevStatus = getStatus(prevDay, index - 1, allDays);
            if (prevStatus === 'completed' || prevStatus === 'current') {
                return 'current';
            }
        } else {
            // First day is always accessible
            return 'current';
        }

        return 'locked';
    };

    const planDays = planDaysList.map((item, index) => ({
        ...item,
        task: item.label,
        status: getStatus(item, index, planDaysList)
    }));

    const handleStartClick = (planItem) => {
        if (!setView || !updateUserProgress) return;

        console.log('Starting day:', planItem.day, 'Surah:', planItem.surah, 'Verses:', planItem.startVerse, '-', planItem.endVerse);

        // Update user progress to navigate to the correct surah and starting verse
        // For review days, start from the beginning of the review range
        const startVerseIndex = planItem.startVerse - 1; // Convert to 0-based index

        updateUserProgress({
            surah: planItem.surah,
            verseIndex: startVerseIndex,
            surahName: planItem.label
        });

        // Small delay to ensure state updates before navigation
        setTimeout(() => {
            setView('memorize');
        }, 100);
    };

    return (
        <div className="container" style={{ paddingBottom: '100px', maxWidth: '800px' }}>
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Your Memorization Plan</h2>
                <p style={{ color: 'var(--text-muted)' }}>Consistent small steps lead to great journeys.</p>
            </header>

            <div className="glass-panel" style={{ padding: '20px' }}>
                {planDays.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '20px',
                            borderBottom: index !== planDays.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            opacity: item.status === 'locked' ? 0.5 : 1
                        }}
                    >
                        <div style={{ marginRight: '20px' }}>
                            {item.status === 'completed' && <CheckCircle color="var(--accent)" size={28} />}
                            {item.status === 'current' && <Circle color="var(--primary)" size={28} fill="rgba(212, 175, 55, 0.2)" />}
                            {item.status === 'locked' && <Lock color="var(--text-muted)" size={24} />}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Day {item.day}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{item.task}</p>
                        </div>

                        {item.status === 'current' && (
                            <button
                                className="btn-primary"
                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                onClick={() => handleStartClick(item)}
                            >
                                Start
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <HadithFooter />
        </div>
    );
};

export default Plan;
