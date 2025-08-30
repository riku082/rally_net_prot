'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CommunityCalendarPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const router = useRouter();

  useEffect(() => {
    // Redirect to the events page which now includes calendar view
    router.replace(`/community/${communityId}/events`);
  }, [communityId, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );
}