import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        {!isHomePage && <Breadcrumbs />}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
