import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { AppHeader } from './AppHeader';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // Pages that have their own header
  const pagesWithOwnHeader = [
    '/',
    '/profile',
    '/profile/settings',
    '/profile/premium',
    '/profile/awards',
    '/profile/recipes',
    '/profile/analytics',
    '/profile/loyalty-cards',
    '/profile/lists',
    '/profile/edit',
    '/profile/affiliate',
    '/organization',
  ];
  
  const hasOwnHeader = pagesWithOwnHeader.some(path => 
    path === location.pathname || location.pathname.startsWith('/organization/')
  );
  
  return (
    <div className="min-h-screen bg-background">
      {!hasOwnHeader && <AppHeader />}
      <main className="pb-20">
        {!isHomePage && !hasOwnHeader && <Breadcrumbs />}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
