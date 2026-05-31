'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { DashboardPageSkeleton } from '@/components/common/loading-skeletons';
import { useAuth } from './use-auth';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isUserLoading } = useAuth();

  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isUserLoading, router]);

  if (!isAuthenticated || isUserLoading) {
    return <DashboardPageSkeleton />;
  }

  return children;
}
