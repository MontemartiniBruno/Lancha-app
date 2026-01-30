'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, DollarSign, Calendar, LogOut, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/pagos', label: 'Pagos', icon: DollarSign },
    { href: '/turnos', label: 'Turnos', icon: Calendar },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  return (
    <nav className="hidden md:flex bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto w-full px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold text-primary-500 cursor-pointer">🚤 Turca</h1>
            </Link>
            <Link 
              href="/info" 
              className="p-2 text-gray-600 hover:text-primary-500 hover:bg-gray-50 rounded-lg transition-colors"
              title="Información"
            >
              <Info className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "transition-colors font-medium",
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              );
            })}
            {user && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600">{user.name}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Salir</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
