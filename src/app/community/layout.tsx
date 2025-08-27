import { ReactNode } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function CommunityLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}