// =====================================================================
// Hello Food Tours — QR scan tracker (backend web module)
//
// Logs every visit to the /scanned page to the QRScans collection.
// Called from src/pages/Scanned.akxxo.js
//
// suppressAuth: true lets the write succeed even though the QRScans
// collection is locked down to admin-only — keeps the data private.
// =====================================================================

import { Permissions, webMethod } from 'wix-web-module';
import wixData from 'wix-data';

export const logScan = webMethod(Permissions.Anyone, async (data = {}) => {
    return wixData.insert(
        'QRScans',
        {
            timestamp: new Date(),
            source:    data.source    || 'qr',
            medium:    data.medium    || '',
            campaign:  data.campaign  || '',
            content:   data.content   || '',
            location:  data.location  || '',
            referrer:  data.referrer  || 'direct',
            userAgent: data.userAgent || '',
            sessionId: data.sessionId || '',
            converted: false
        },
        { suppressAuth: true }
    );
});

export const markConverted = webMethod(Permissions.Anyone, async (sessionId) => {
    if (!sessionId) return null;

    const r = await wixData.query('QRScans')
        .eq('sessionId', sessionId)
        .find({ suppressAuth: true });

    if (!r.items.length) return null;

    const row = r.items[0];
    row.converted = true;
    return wixData.update('QRScans', row, { suppressAuth: true });
});
