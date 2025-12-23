import React from 'react';
import ProfilerClient from './ProfilerClient';

export default function DeepProfilerPage() {
  const envApiKey = process.env.GOOGLE_API_KEY;

  return <ProfilerClient envApiKey={envApiKey} />;
}
