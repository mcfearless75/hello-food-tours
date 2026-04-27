// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// Thank You Page — fires after a successful booking.
// If the visitor originally arrived via the QR code, this flips the
// `converted` flag on their QRScans row to true. That single field
// turns the QRScans collection from "scan counts" into commercial truth.

import { session } from 'wix-storage-frontend';
import { markConverted } from 'backend/qr-tracker.web';
import { rendering } from 'wix-window-frontend';

$w.onReady(async () => {
    // Skip SSR — Wix renders this page on the server and again in the browser.
    // Without this guard the conversion update can fire before the session ID
    // exists in browser storage.
    if (rendering.env !== 'browser') return;

    let sid = '';
    try { sid = session.getItem('qrSessionId') || ''; } catch (e) { /* ignore */ }
    if (!sid) return;

    try {
        await markConverted(sid);
        // Clear the marker so a refresh doesn't double-count
        try { session.removeItem('qrSessionId'); } catch (e) { /* ignore */ }
    } catch (err) {
        console.error('QR conversion update failed', err);
    }
});
