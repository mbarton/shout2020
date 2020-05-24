import React, { useState, useRef } from 'react';
import useOnClickOutside from 'use-onclickoutside';

export function ShareButton({ id, peerId, connected } : { id: string, peerId: string, connected: boolean }) {
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    
    const ref = useRef<HTMLButtonElement>(null);
    useOnClickOutside(ref, () => setShowCopyMessage(false));

    const disabled = !connected || showCopyMessage;

    async function copyLink() {
        if(peerId) {
            const link = `${window.location.origin}/join?id=${id}&seed=${peerId}`;
            await navigator.clipboard.writeText(link);

            setShowCopyMessage(true);
        }
    }

    return <button className="button" disabled={disabled} onClick={copyLink} ref={ref}>
        {showCopyMessage ? "Link copied" : "Share"}
    </button>;
}