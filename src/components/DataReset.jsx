import React from 'react';
import { RefreshCw } from 'lucide-react';

const DataReset = () => {
    const resetData = () => {
        if (confirm('⚠️ This will delete ALL your progress and log you out. Are you sure?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <button
            onClick={resetData}
            style={{
                position: 'fixed',
                bottom: '100px',
                right: '20px',
                background: 'rgba(255, 0, 0, 0.2)',
                border: '1px solid rgba(255, 0, 0, 0.5)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1000
            }}
            title="Reset All Data (for testing)"
        >
            <RefreshCw size={24} color="#ff0000" />
        </button>
    );
};

export default DataReset;
