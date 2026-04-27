// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// Scanned page — fires when someone arrives via the QR code on a poster.
// Logs the scan to the QRScans collection via the qr-tracker backend module.

import wixLocation from 'wix-location';
import { session } from 'wix-storage-frontend';
import { logScan } from 'backend/qr-tracker.web';

$w.onReady(async () => {
    const q = wixLocation.query || {};

    // Generate a session ID we can later use to flag this scan as
    // "converted" if the visitor goes on to make a booking.
    const sessionId =
        (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);

    // Fire-and-forget — don't block the page render on the log call.
    logScan({
        source:    q.utm_source,
        medium:    q.utm_medium,
        campaign:  q.utm_campaign,
        content:   q.utm_content,   // which poster variant (a4dark, square, etc.)
        location:  q.loc,           // physical placement (window, cafe, marketstall...)
        referrer:  (typeof document !== 'undefined' && document.referrer) || 'direct',
        userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || '',
        sessionId: sessionId
    }).catch(err => console.error('QR log failed', err));

    // Stash the session ID so a later booking confirmation can attribute
    // back to this exact scan (see Thank You Page.iavbk.js).
    try {
        session.setItem('qrSessionId', sessionId);
        session.setItem('qrCampaign',  q.utm_campaign || '');
        session.setItem('qrLocation',  q.loc || '');
    } catch (e) { /* private browsing — ignore */ }
});
