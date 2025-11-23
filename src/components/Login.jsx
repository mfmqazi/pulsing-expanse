import React, { useState } from 'react';
import { User, Lock, ArrowRight, UserCircle } from 'lucide-react';
import { registerUser, loginUser } from '../services/database';

const Login = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (isRegistering) {
            if (!firstName || !lastName) {
                setError('Please enter your first and last name');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
        }

        setLoading(true);

        try {
            let result;
            if (isRegistering) {
                result = await registerUser(username, password, firstName, lastName);
            } else {
                result = await loginUser(username, password);
            }

            if (result.success) {
                onLogin(result.user);
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 12px 12px 40px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        color: 'white',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
    };

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '10px' }}>Al-Hafiz</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{isRegistering ? 'Begin your journey' : 'Welcome back'}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>First Name</label>
                                <div style={{ position: 'relative' }}>
                                    <UserCircle size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={loading}
                                        style={inputStyle}
                                        placeholder="Enter first name"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Last Name</label>
                                <div style={{ position: 'relative' }}>
                                    <UserCircle size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={loading}
                                        style={inputStyle}
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                style={inputStyle}
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: isRegistering ? '20px' : '30px' }}>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                style={inputStyle}
                                placeholder="Enter password"
                            />
                        </div>
                    </div>

                    {isRegistering && (
                        <div style={{ marginBottom: '30px' }}>
                            <label style={labelStyle}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    style={inputStyle}
                                    placeholder="Re-enter password"
                                />
                            </div>
                        </div>
                    )}

                    {error && <p style={{ color: '#EF4444', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginBottom: '20px', opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Login')} <ArrowRight size={20} />
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        {!isRegistering ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegistering(true);
                                    setError('');
                                }}
                                className="btn-outline"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                Sign Up
                            </button>
                        ) : (
                            <p
                                style={{ color: 'var(--text-muted)', cursor: 'pointer', margin: 0 }}
                                onClick={() => {
                                    setIsRegistering(false);
                                    setError('');
                                    setFirstName('');
                                    setLastName('');
                                    setConfirmPassword('');
                                }}
                            >
                                Already have an account? <span style={{ color: 'var(--primary)' }}>Login</span>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
