import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const hashPassword = async (password) => {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('quran_app_users') || '{}');

            if (isRegistering) {
                if (users[username]) {
                    setError('Username already exists');
                    return;
                }

                const hashedPassword = await hashPassword(password);

                // Create new user with initial state
                const newUser = {
                    username,
                    password: hashedPassword,
                    progress: {
                        surah: 1,
                        verseIndex: 0,
                        surahName: 'Surah Al-Fatiha',
                        percent: 0,
                        memorized: {} // Track memorized verses by surah
                    },
                    streak: 0,
                    joinedDate: new Date().toISOString()
                };
                users[username] = newUser;
                localStorage.setItem('quran_app_users', JSON.stringify(users));
                onLogin(newUser);
            } else {
                const user = users[username];
                if (user) {
                    const hashedPassword = await hashPassword(password);

                    if (user.password === hashedPassword) {
                        onLogin(user);
                    } else if (user.password === password) {
                        // Migration: Stored password is plain text, but matches input
                        console.log('Migrating password to hash...');
                        user.password = hashedPassword;
                        users[username] = user;
                        localStorage.setItem('quran_app_users', JSON.stringify(users));
                        onLogin(user);
                    } else {
                        setError('Invalid credentials');
                    }
                } else {
                    setError('Invalid credentials');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Error accessing storage. Please check your browser settings.');
        }
    };

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '10px' }}>Al-Hafiz</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{isRegistering ? 'Begin your journey' : 'Welcome back'}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                placeholder="Enter password"
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: '#EF4444', marginBottom: '20px', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '20px' }}>
                        {isRegistering ? 'Start Journey' : 'Resume Session'} <ArrowRight size={20} />
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
