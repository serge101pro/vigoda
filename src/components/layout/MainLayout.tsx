import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { UnifiedHeader } from './UnifiedHeader';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

// Pages that have their own custom header (don't show unified header)
const pagesWithCustomHeader = [
  '/',
  '/profile',
  '/profile/settings',
  '/profile/premium',
  '/profile/recipes',
  '/profile/edit',
  '/profile/awards',
  '/profile/analytics',
  '/profile/loyalty-cards',
  '/profile/lists',
  '/profile/affiliate',
  '/social-recipes',
  '/organization',
];

export function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const hasCustomHeader = pagesWithCustomHeader.some(
    path => location.pathname === path || location.pathname.startsWith('/organization/')
  );
  
  return (
    <div className="min-h-screen bg-background">
      {!hasCustomHeader && <UnifiedHeader />}
      <main className="pb-20">
        {!isHomePage && !hasCustomHeader && <Breadcrumbs />}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
