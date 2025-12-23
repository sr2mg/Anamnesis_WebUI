import React from 'react';
import MultiClient from './MultiClient';

export default function MultiTalkPage() {
    const envApiKey = process.env.GOOGLE_API_KEY;

    return <MultiClient envApiKey={envApiKey} />;
}
