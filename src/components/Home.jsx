import React from 'react';
import { Play, Award, Calendar, Activity as ActivityIcon, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { getCurrentPlan } from '../data/memorizationPlan';
import HadithFooter from './HadithFooter';

const Home = ({ setView, user, onLogout }) => {
    const currentPlan = getCurrentPlan(
        user?.progress?.surah || 1,
        user?.progress?.verseIndex || 0,
        user?.settings
    );

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Al-Hafiz</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back, {user?.firstName || user?.username}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setView('settings')}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                        title="Settings"
                    >
                        <SettingsIcon size={20} />
                    </button>
                    <button
                        onClick={onLogout}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Assalamu Alaikum, {user?.firstName || user?.username || 'Hafiz'}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Continue your memorization of {currentPlan?.label || 'Surah Al-Fatiha'}</p>
                </div>
                <button className="btn-primary" onClick={() => setView('memorize')}>
                    <Play size={20} fill="black" /> Resume Session
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Daily Goal Card */}
                <div className="glass-panel" style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '10px' }}>
                            <ActivityIcon color="var(--accent)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>Current Goal</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {currentPlan?.label || 'Surah Al-Fatiha'}
                            </p>
                        </div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Daily Goal</span>
                            <span style={{ color: 'var(--accent)' }}>{user?.progress?.percent || 0}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${user?.progress?.percent || 0}%`, height: '100%', background: 'var(--accent)' }}></div>
                        </div>
                    </div>

                    {/* Daily Verses Stat */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Today's Goal</span>
                        <span style={{ fontWeight: 'bold', color: 'white' }}>
                            {(() => {
                                const dailyMemorized = user?.progress?.dailyMemorized || [];
                                const today = new Date().toDateString();
                                const lastActivityDate = user?.lastActivityDate;

                                // Reset count if it's a new day
                                const actualCount = lastActivityDate === today ? dailyMemorized.length : 0;

                                const versesPerDay = user?.settings?.planType === 'custom'
                                    ? (parseInt(user?.settings?.versesPerDay) || 5)
                                    : Math.max(1, Math.ceil(6236 / ((parseFloat(user?.settings?.targetDuration) || 2) * 365)));

                                return `${actualCount} / ${versesPerDay}`;
                            })()}
                        </span>
                    </div>

                    {/* Plan Segment Progress */}
                    {user?.progress?.planProgress !== undefined && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Plan Segment</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{user.progress.planProgress}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${user.progress.planProgress}%`, height: '100%', background: 'var(--primary)' }}></div>
                            </div>
                        </div>
                    )}

                    {/* Total Progress Stat */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Memorized</span>
                        <span style={{ fontWeight: 'bold', color: 'white' }}>
                            {(() => {
                                const memorized = user?.progress?.memorized || {};
                                let total = 0;
                                Object.values(memorized).forEach(surahVerses => {
                                    total += surahVerses.length;
                                });
                                return total;
                            })()} Verses
                        </span>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="glass-panel" style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(212, 175, 55, 0.2)', padding: '10px', borderRadius: '10px' }}>
                            <Award color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem' }}>Current Streak</h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {user?.streak || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Days</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Masha'Allah! Keep it up.</p>
                </div>

                {/* Plan Overview */}
                <div className="glass-panel" style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '10px' }}>
                            <Calendar color="#3B82F6" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem' }}>Memorization Plan</h3>
                    </div>
                    <p style={{ marginBottom: '15px' }}>
                        Target: {
                            (() => {
                                const duration = user?.settings?.targetDuration || 1;
                                if (duration < 1) return `${Math.round(duration * 12)} Months`;
                                return `${duration} Year${duration > 1 ? 's' : ''}`;
                            })()
                        }
                    </p>
                    <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setView('plan')}>
                        View Full Plan
                    </button>
                </div>
            </div>

            <HadithFooter />
        </div>
    );
};

export default Home;
