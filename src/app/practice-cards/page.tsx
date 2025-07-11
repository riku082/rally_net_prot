'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PracticeCardsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/practice-management?tab=cards');
  }, [router]);

  return null;
}