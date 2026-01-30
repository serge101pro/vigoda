import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  color?: string;
}

const routeLabels: Record<string, { label: string; color: string }> = {
  '': { label: 'Главная', color: 'bg-primary/10 text-primary' },
  'catalog': { label: 'Каталог', color: 'bg-blue-500/10 text-blue-600' },
  'cart': { label: 'Корзина', color: 'bg-orange-500/10 text-orange-600' },
  'recipes': { label: 'Рецепты', color: 'bg-amber-500/10 text-amber-600' },
  'recipe': { label: 'Рецепт', color: 'bg-amber-500/10 text-amber-600' },
  'favorites': { label: 'Избранное', color: 'bg-red-500/10 text-red-600' },
  'ready-meals': { label: 'Готовые блюда', color: 'bg-green-500/10 text-green-600' },
  'ready-meal': { label: 'Блюдо', color: 'bg-green-500/10 text-green-600' },
  'product': { label: 'Товар', color: 'bg-purple-500/10 text-purple-600' },
  'meal-plan': { label: 'Рацион', color: 'bg-teal-500/10 text-teal-600' },
  'catering': { label: 'Кейтеринг', color: 'bg-pink-500/10 text-pink-600' },
  'promos': { label: 'Акции', color: 'bg-red-500/10 text-red-600' },
  'promo': { label: 'Акция', color: 'bg-red-500/10 text-red-600' },
  'farm-products': { label: 'Фермерские продукты', color: 'bg-green-500/10 text-green-600' },
  'farm-product': { label: 'Фермерский продукт', color: 'bg-green-500/10 text-green-600' },
  'stores': { label: 'Магазины', color: 'bg-blue-500/10 text-blue-600' },
  'store': { label: 'Магазин', color: 'bg-blue-500/10 text-blue-600' },
  'farms': { label: 'Фермы', color: 'bg-green-500/10 text-green-600' },
  'farm': { label: 'Ферма', color: 'bg-green-500/10 text-green-600' },
  'family': { label: 'Семейное планирование', color: 'bg-purple-500/10 text-purple-600' },
  'social-recipes': { label: 'Клуб Кулинаров', color: 'bg-amber-500/10 text-amber-600' },
  'payment': { label: 'Оплата', color: 'bg-green-500/10 text-green-600' },
  'profile': { label: 'Профиль', color: 'bg-indigo-500/10 text-indigo-600' },
  'premium': { label: 'Премиум', color: 'bg-amber-500/10 text-amber-600' },
  'settings': { label: 'Настройки', color: 'bg-gray-500/10 text-gray-600' },
  'awards': { label: 'Награды', color: 'bg-yellow-500/10 text-yellow-600' },
  'analytics': { label: 'Аналитика', color: 'bg-blue-500/10 text-blue-600' },
  'loyalty-cards': { label: 'Карты лояльности', color: 'bg-purple-500/10 text-purple-600' },
  'lists': { label: 'Списки покупок', color: 'bg-green-500/10 text-green-600' },
  'edit': { label: 'Редактирование', color: 'bg-gray-500/10 text-gray-600' },
  'addresses': { label: 'Адреса', color: 'bg-blue-500/10 text-blue-600' },
  'affiliate': { label: 'Партнёрская программа', color: 'bg-primary/10 text-primary' },
  'nearest-stores': { label: 'Ближайшие магазины', color: 'bg-blue-500/10 text-blue-600' },
  'payment-methods': { label: 'Способы оплаты', color: 'bg-green-500/10 text-green-600' },
  'wallet': { label: 'Кошелёк', color: 'bg-emerald-500/10 text-emerald-600' },
  'about': { label: 'О приложении', color: 'bg-gray-500/10 text-gray-600' },
  // Admin pages
  'admin': { label: 'Админ-панель', color: 'bg-red-500/10 text-red-600' },
  'users': { label: 'Пользователи', color: 'bg-blue-500/10 text-blue-600' },
  'roles': { label: 'Роли', color: 'bg-purple-500/10 text-purple-600' },
  'orders': { label: 'Заказы', color: 'bg-green-500/10 text-green-600' },
  'subscriptions': { label: 'Подписки', color: 'bg-orange-500/10 text-orange-600' },
  'content': { label: 'Контент', color: 'bg-pink-500/10 text-pink-600' },
  'notifications': { label: 'Уведомления', color: 'bg-yellow-500/10 text-yellow-600' },
  'database': { label: 'База данных', color: 'bg-slate-500/10 text-slate-600' },
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', path: '/', color: routeLabels[''].color },
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip numeric IDs in breadcrumbs display but keep the path
    if (!isNaN(Number(segment)) || segment.length > 20) {
      return;
    }

    const routeInfo = routeLabels[segment] || { label: segment, color: 'bg-muted text-muted-foreground' };
    breadcrumbs.push({
      label: routeInfo.label,
      path: currentPath,
      color: routeInfo.color,
    });
  });

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-2 px-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-1.5 flex-shrink-0">
          {index > 0 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${crumb.color}`}>
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${crumb.color} hover:opacity-80 transition-opacity`}
            >
              {index === 0 ? <Home className="h-3 w-3" /> : crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
