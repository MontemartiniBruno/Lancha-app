'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopNav } from '@/components/layout/TopNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();
  const publicRoutes = ['/login', '/debug'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <TopNav />
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </ProtectedRoute>
  );
}
