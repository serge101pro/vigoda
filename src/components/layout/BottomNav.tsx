import { NavLink } from '@/components/NavLink';
import { useAppStore } from '@/stores/useAppStore';

// Import HD navigation icons
import navHome from '@/assets/icons/nav-home.png';
import navCatalog from '@/assets/icons/nav-catalog.png';
import navRecipes from '@/assets/icons/nav-recipes.png';
import navMeals from '@/assets/icons/nav-meals.png';
import navCatering from '@/assets/icons/nav-catering.png';
import navCart from '@/assets/icons/nav-cart.png';

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
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 overflow-hidden"
          activeClassName="ring-2 ring-primary/50"
        >
          <SafeImage src={navHome} alt="Главная" className="h-7 w-7 object-contain" />
        </NavLink>

        {/* Catalog */}
        <NavLink
          to="/catalog"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <SafeImage src={navCatalog} alt="Каталог" className="h-6 w-6 object-contain" />
          <span className="mt-0.5 text-[10px] font-medium">Каталог</span>
        </NavLink>

        {/* Recipes */}
        <NavLink
          to="/recipes"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <SafeImage src={navRecipes} alt="Рецепты" className="h-6 w-6 object-contain" />
          <span className="mt-0.5 text-[10px] font-medium">Рецепты</span>
        </NavLink>

        {/* Ready Meals */}
        <NavLink
          to="/ready-meals"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <SafeImage src={navMeals} alt="Готовое" className="h-6 w-6 object-contain" />
          <span className="mt-0.5 text-[10px] font-medium">Готовое</span>
        </NavLink>

        {/* Catering */}
        <NavLink
          to="/catering"
          className="bottom-nav-item bottom-nav-item-inactive"
          activeClassName="bottom-nav-item-active"
        >
          <SafeImage src={navCatering} alt="Кейтеринг" className="h-6 w-6 object-contain" />
          <span className="mt-0.5 text-[10px] font-medium">Кейтеринг</span>
        </NavLink>

        {/* Cart - Circular Button */}
        <NavLink
          to="/cart"
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 overflow-hidden"
          activeClassName="ring-2 ring-primary/50"
        >
          <SafeImage src={navCart} alt="Корзина" className="h-7 w-7 object-contain" />
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
