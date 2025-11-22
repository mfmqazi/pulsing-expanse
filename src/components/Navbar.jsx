import React from 'react';
import { BookOpen, Home, Settings, Activity } from 'lucide-react';

const Navbar = ({ currentView, setView }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'memorize', label: 'Memorize', icon: BookOpen },
        { id: 'plan', label: 'My Plan', icon: Activity },
        // { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            padding: '10px 20px',
            display: 'flex',
            gap: '20px'
        }}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        style={{
                            background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                            border: 'none',
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '60px'
                        }}
                    >
                        <Icon size={24} />
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default Navbar;
