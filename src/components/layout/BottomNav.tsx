import { Home, Search, ShoppingCart, ChefHat, UtensilsCrossed } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAppStore } from '@/stores/useAppStore';

export function BottomNav() {
  const cart = useAppStore((state) => state.cart);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-1.5">
        {/* Home - Circular Button */}
        <NavLink
          to="/"
          end
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          activeClassName="ring-2 ring-primary/50"
        >
          <Home className="h-6 w-6 stroke-[2.5]" />
        </NavLink>

        {/* Catalog */}
        <NavLink
          to="/catalog"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <Search className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-medium">Каталог</span>
        </NavLink>

        {/* Recipes */}
        <NavLink
          to="/recipes"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <ChefHat className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-medium">Рецепты</span>
        </NavLink>

        {/* Ready Meals */}
        <NavLink
          to="/ready-meals"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-medium">Готовое</span>
        </NavLink>

        {/* Catering */}
        <NavLink
          to="/catering"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <span className="text-lg">🍽️</span>
          <span className="mt-0.5 text-[10px] font-medium">Кейтеринг</span>
        </NavLink>

        {/* Cart - Circular Button */}
        <NavLink
          to="/cart"
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          activeClassName="ring-2 ring-primary/50"
        >
          <ShoppingCart className="h-6 w-6 stroke-[2.5]" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {cartItemsCount > 99 ? '99+' : cartItemsCount}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
