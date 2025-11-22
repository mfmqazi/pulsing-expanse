import React from 'react';
import { Play, Award, Calendar, Activity, LogOut } from 'lucide-react';

const Home = ({ setView, user, onLogout }) => {
    console.log('🏠 Home component - User data:', {
        percent: user?.progress?.percent,
        streak: user?.streak,
        memorized: user?.progress?.memorized,
        fullUser: user
    });

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <header style={{ marginBottom: '40px', textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={onLogout}
                    style={{ position: 'absolute', right: 0, top: 0, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <LogOut size={20} />
                </button>
                <h1 style={{ fontSize: '3rem', marginBottom: '10px', color: 'var(--primary)' }}>Al-Hafiz</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Your Journey to Memorizing the Holy Quran</p>
            </header>

            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Assalamu Alaikum, {user?.username || 'Hafiz'}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Continue your memorization of {user?.progress?.surahName || 'Surah Al-Fatiha'}</p>
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
                        <h3 style={{ fontSize: '1.2rem' }}>Daily Goal</h3>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Progress</span>
                            <span style={{ color: 'var(--accent)' }}>{user?.progress?.percent || 0}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${user?.progress?.percent || 0}%`, height: '100%', background: 'var(--accent)' }}></div>
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keep going to reach your goal!</p>
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
                    <p style={{ marginBottom: '15px' }}>Target: 2 Years</p>
                    <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setView('plan')}>
                        View Full Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActivityIcon = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default Home;
