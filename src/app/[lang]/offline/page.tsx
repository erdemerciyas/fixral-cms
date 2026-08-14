'use client';

import StatusTemplate from '@/templates/StatusTemplate';

export default function OfflinePage() {
  return (
    <StatusTemplate
      code="OFFLINE"
      title="You Are Offline"
      description="It looks like you are not connected to the internet. Some features may not be available until you reconnect."
      actionLabel="Try Again"
      onAction={() => window.location.reload()}
    />
  );
}
