import React from 'react';

const DataLoadNotice = ({ title, message }) => (
    <section
        role="alert"
        aria-live="polite"
        style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem 1rem',
            marginBottom: '0.75rem',
            padding: '0.9rem 1rem',
            border: '1px solid #e3b4a3',
            borderRadius: '12px',
            background: '#fff7f2',
            color: '#703d2e',
        }}
    >
        <div style={{ minWidth: 0, flex: '1 1 18rem' }}>
            <strong>{title}</strong>
            <p style={{ margin: '0.25rem 0 0', lineHeight: 1.5, fontSize: '0.9rem' }}>{message}</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem' }}>
                Your saved records have not been deliberately deleted. Retry after checking your connection.
            </p>
        </div>
        <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
                border: '1px solid #bc8f7c',
                borderRadius: '8px',
                padding: '0.55rem 0.8rem',
                background: '#fff',
                color: '#703d2e',
                font: 'inherit',
                fontWeight: 600,
                cursor: 'pointer',
            }}
        >
            Retry
        </button>
    </section>
);

export default DataLoadNotice;
