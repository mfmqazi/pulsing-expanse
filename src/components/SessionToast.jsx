import React, { useState, useEffect } from 'react';

export const useSessionStatus = () => {
    const [lastSaved, setLastSaved] = useState(null);
    const [showToast, setShowToast] = useState(false);

    const markSaved = () => {
        setLastSaved(new Date());
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    return { lastSaved, showToast, markSaved };
};

export const SessionToast = ({ show, message = "Session saved" }) => {
    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '90px',
                right: '20px',
                background: 'rgba(16, 185, 129, 0.9)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                zIndex: 1000,
                animation: 'slideIn 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
        >
            ✓ {message}
            <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
};
