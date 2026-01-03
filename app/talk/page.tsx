import React from 'react';
import TalkClient from './TalkClient';

export const dynamic = 'force-dynamic';

export default function TalkPage() {
    const envApiKey = process.env.GOOGLE_API_KEY;

    return <TalkClient envApiKey={envApiKey} />;
}
