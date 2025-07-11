'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PracticeSchedulePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/practice-management?tab=calendar');
  }, [router]);

  return null;
}