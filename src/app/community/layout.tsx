'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function CommunityLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Sidebar activePath={pathname} />
      <div className="flex-1 lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}