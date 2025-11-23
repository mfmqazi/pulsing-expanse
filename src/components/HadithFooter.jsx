import React from 'react';
import { BookOpen } from 'lucide-react';

const HadithFooter = () => {
    return (
        <div style={{
            marginTop: '40px',
            padding: '20px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '12px',
            textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <BookOpen size={24} color="var(--primary)" />
            </div>
            <p style={{
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '8px',
                fontStyle: 'italic'
            }}>
                "Such a person as recites the Quran and masters it by heart, will be with the noble righteous scribes (in Heaven).
                And such a person exerts himself to learn the Quran by heart, and recites it with great difficulty, will have a double reward."
            </p>
            <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '10px'
            }}>
                — Prophet Muhammad ﷺ [Sahih Bukhari: Book 6 - Volume 60, Hadith 459]
            </p>
        </div>
    );
};

export default HadithFooter;
