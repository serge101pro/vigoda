import { Home, Search, ShoppingCart, ChefHat, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAppStore } from '@/stores/useAppStore';

const navItems = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/catalog', icon: Search, label: 'Каталог' },
  { to: '/cart', icon: ShoppingCart, label: 'Корзина' },
  { to: '/recipes', icon: ChefHat, label: 'Рецепты' },
  { to: '/profile', icon: User, label: 'Профиль' },
];

export function BottomNav() {
  const cart = useAppStore((state) => state.cart);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="bottom-nav-item bottom-nav-item-inactive relative"
            activeClassName="bottom-nav-item-active"
          >
            <div className="relative">
              <item.icon className="h-6 w-6" />
              {item.to === '/cart' && cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </div>
            <span className="mt-1 text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
