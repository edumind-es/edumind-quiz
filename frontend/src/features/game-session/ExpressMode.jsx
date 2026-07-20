import React from 'react';

export default function ExpressMode() {
    return (
        <div className="p-8 text-white">
            <h1 className="text-3xl font-bold text-[var(--color-success)]">Express Mode</h1>
            <p>Upload JSON/TXT/MD to start instantaneously.</p>
            {/* TODO: File Upload, AI Parse, Game Session */}
        </div>
    );
}
