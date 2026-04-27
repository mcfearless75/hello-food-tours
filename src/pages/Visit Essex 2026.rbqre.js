// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// Visit Essex 2026 page — serves the URL `/book-online`, which is what the
// printed QR-code posters resolve to. Logs the scan to the QRScans collection
// via the qr-tracker backend module, then stashes a session ID so the Thank
// You Page can flip `converted` to true if the visitor goes on to book.

import wixLocation from 'wix-location';
import { session } from 'wix-storage-frontend';
import { logScan } from 'backend/qr-tracker.web';
import { rendering } from 'wix-window-frontend';

$w.onReady(async () => {
    // Skip SSR — Wix renders this page on the server and again in the browser.
    // Without this guard each scan logs twice (once with empty userAgent).
    if (rendering.env !== 'browser') return;

    const q = wixLocation.query || {};

    // Generate a session ID we can later use to flag this scan as
    // "converted" if the visitor goes on to make a booking.
    const sessionId =
        (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);

    // Fire-and-forget — don't block the page render on the log call.
    logScan({
        source:    q.utm_source    || 'flyer',
        medium:    q.utm_medium    || 'qr',
        campaign:  q.utm_campaign  || 'saffron_walden',
        content:   q.utm_content   || '',          // poster variant if encoded
        location:  q.loc           || 'saffron_walden',
        referrer:  (typeof document !== 'undefined' && document.referrer) || 'direct',
        userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || '',
        sessionId: sessionId
    }).catch(err => console.error('QR log failed', err));

    // Stash the session ID so a later booking confirmation can attribute
    // back to this exact scan (see Thank You Page.iavbk.js).
    try {
        session.setItem('qrSessionId', sessionId);
        session.setItem('qrCampaign',  q.utm_campaign || 'saffron_walden');
        session.setItem('qrLocation',  q.loc || 'saffron_walden');
    } catch (e) { /* private browsing — ignore */ }
});
