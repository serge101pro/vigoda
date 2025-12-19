import { useState } from 'react';
import { Search, Heart, ChefHat, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PromoBanner } from '@/components/ui/PromoBanner';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { MealCarousel } from '@/components/home/MealCarousel';
import { MealPlanCarousel } from '@/components/home/MealPlanCarousel';
import { CateringCarousel } from '@/components/home/CateringCarousel';
import { VoiceSearch } from '@/components/home/VoiceSearch';
import { PromoBannerCarousel } from '@/components/home/PromoBannerCarousel';
import { CategoryChipsCarousel } from '@/components/home/CategoryChipsCarousel';
import { HeaderAvatar } from '@/components/home/HeaderAvatar';
import { AddressDropdown } from '@/components/home/AddressDropdown';
import { LanguageSelector } from '@/components/home/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { mockProducts, mockRecipes } from '@/data/mockData';
import heroImage from '@/assets/hero-groceries.jpg';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';

// Mock data for various sections
const farmProducts = mockProducts.slice(0, 6).map(p => ({
  ...p,
  badge: 'new' as const,
  name: `Фермерский ${p.name.toLowerCase()}`
}));

const monthNames = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
const currentMonth = monthNames[new Date().getMonth()];

const saleProducts = mockProducts.filter(p => p.badge === 'sale' || p.badge === 'hot');

const readyMeals = [
  { id: '1', name: 'Куриная грудка с киноа', image: mockProducts[3]?.image || '', weight: 350, calories: 420, protein: 38, price: 449, oldPrice: 549, rating: 4.8 },
  { id: '2', name: 'Лосось терияки с рисом', image: mockProducts[6]?.image || '', weight: 380, calories: 520, protein: 32, price: 649, rating: 4.9 },
  { id: '3', name: 'Греческий салат с фетой', image: mockProducts[0]?.image || '', weight: 250, calories: 280, protein: 8, price: 349, oldPrice: 399, rating: 4.6 },
  { id: '4', name: 'Борщ со сметаной', image: mockProducts[12]?.image || '', weight: 400, calories: 320, protein: 18, price: 299, rating: 4.7 },
  { id: '5', name: 'Паста Карбонара', image: mockProducts[10]?.image || '', weight: 320, calories: 580, protein: 22, price: 399, rating: 4.8 },
  { id: '6', name: 'Овсянка с ягодами', image: mockProducts[13]?.image || '', weight: 280, calories: 340, protein: 12, price: 249, rating: 4.5 },
];

const mealPlans = [
  { id: '1', name: 'Сбалансированное питание', image: mockProducts[11]?.image || '', days: 7, mealsPerDay: 5, caloriesPerDay: 1800, price: 6990, pricePerDay: 999, discount: 15, rating: 4.9, isPopular: true },
  { id: '2', name: 'Похудение без голода', image: mockProducts[1]?.image || '', days: 14, mealsPerDay: 5, caloriesPerDay: 1400, price: 11990, pricePerDay: 857, discount: 20, rating: 4.8 },
  { id: '3', name: 'Набор массы', image: mockProducts[12]?.image || '', days: 7, mealsPerDay: 6, caloriesPerDay: 2800, price: 8990, pricePerDay: 1284, rating: 4.7 },
  { id: '4', name: 'Вегетарианский', image: mockProducts[0]?.image || '', days: 7, mealsPerDay: 4, caloriesPerDay: 1600, price: 5990, pricePerDay: 856, rating: 4.6 },
];

const cateringOffers = [
  { id: '1', title: 'Семейный ужин', description: 'Уютный ужин на дому для всей семьи', image: mockProducts[3]?.image || '', category: 'home' as const, priceFrom: 2500, guestsMin: 4, guestsMax: 8 },
  { id: '2', title: 'Бизнес-ланч', description: 'Деловые обеды с доставкой в офис', image: mockProducts[10]?.image || '', category: 'office' as const, priceFrom: 450, guestsMin: 10, guestsMax: 50 },
  { id: '3', title: 'День рождения', description: 'Праздничное меню для особого дня', image: mockProducts[5]?.image || '', category: 'themed' as const, priceFrom: 3500, guestsMin: 8, guestsMax: 30 },
  { id: '4', title: 'Корпоратив', description: 'Фуршет и банкет для компании', image: mockProducts[6]?.image || '', category: 'office' as const, priceFrom: 800, guestsMin: 20, guestsMax: 100 },
  { id: '5', title: 'Детский праздник', description: 'Весёлое меню для малышей', image: mockProducts[13]?.image || '', category: 'themed' as const, priceFrom: 1500, guestsMin: 6, guestsMax: 20 },
  { id: '6', title: 'Романтический ужин', description: 'Изысканный ужин на двоих', image: mockProducts[6]?.image || '', category: 'home' as const, priceFrom: 3000, guestsMin: 2, guestsMax: 2 },
  { id: '7', title: 'Пикник на природе', description: 'Готовые сеты для пикника', image: mockProducts[0]?.image || '', category: 'themed' as const, priceFrom: 1800, guestsMin: 4, guestsMax: 12 },
  { id: '8', title: 'Кофе-брейк', description: 'Перерыв на кофе с угощениями', image: mockProducts[4]?.image || '', category: 'office' as const, priceFrom: 250, guestsMin: 10, guestsMax: 100 },
  { id: '9', title: 'Свадебный банкет', description: 'Праздничное меню для свадьбы', image: mockProducts[7]?.image || '', category: 'themed' as const, priceFrom: 5000, guestsMin: 30, guestsMax: 200 },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { hasPaidPlan } = useSubscription();

  const savings = profile?.total_savings || 2450;
  const bonusPoints = profile?.bonus_points || 1280;

  const handleVoiceResult = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <div className="page-container">
      {/* Header - 2.2 */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Avatar + Address */}
            <div className="flex items-center gap-3">
              {/* 2.2.1 Avatar */}
              <HeaderAvatar />
              
              {/* 2.2.2 Address Dropdown */}
              <AddressDropdown />
            </div>
            
            {/* Right: Favorites, Language, Theme */}
            <div className="flex items-center gap-1">
              {/* 2.2.3 Favorites icon */}
              <Link to="/favorites">
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              
              {/* 2.2.4 Language selector */}
              <LanguageSelector />
              
              {/* 2.2.5 Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Promo Banner Carousel - 2.2 (после шапки) */}
      <section className="px-4 pt-4">
        <PromoBannerCarousel />
      </section>

      {/* Search with voice input - 2.3 */}
      <section className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search"
          />
          <VoiceSearch 
            onResult={handleVoiceResult} 
            className="absolute right-2 top-1/2 -translate-y-1/2"
          />
        </div>
      </section>

      {/* Stats Cards Row - Экономия, Бонусы, Рецепты - 2.3, 2.4, 2.5 */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Ваша экономия */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-3 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">💰</span>
              <span className="text-xs text-muted-foreground">Экономия</span>
            </div>
            <p className="text-lg font-bold text-primary">{savings.toLocaleString()} ₽</p>
            <p className="text-xs text-muted-foreground">в {currentMonth}</p>
            <Link to={hasPaidPlan ? "/profile/affiliate" : "/profile/premium"}>
              <Button size="sm" variant="accent" className="w-full text-xs h-6 mt-2">
                Хочу больше
              </Button>
            </Link>
          </div>

          {/* Ваши бонусы */}
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">⭐</span>
              <span className="text-xs text-muted-foreground">Бонусы</span>
            </div>
            <p className="text-lg font-bold text-foreground">{bonusPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">доступно</p>
            <Link to="/profile/affiliate">
              <Button size="sm" variant="outline" className="w-full text-xs h-6 mt-2">
                Получить
              </Button>
            </Link>
          </div>

          {/* Ваши рецепты */}
          <Link to="/profile/recipes" className="bg-card rounded-2xl p-3 border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-1.5 mb-1">
              <ChefHat className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Рецепты</span>
            </div>
            <p className="text-sm font-medium text-foreground mt-1">Ваши рецепты</p>
            <p className="text-xs text-muted-foreground">и подписки</p>
            <div className="flex justify-end mt-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </section>

      {/* Banner: Скидки дня - 2.7 */}
      <section className="px-4 pt-4">
        <Link to="/catalog?filter=sale">
          <PromoBanner
            title="Скидки дня"
            subtitle="До 50% на популярные товары!"
            buttonText="Смотреть"
            buttonLink="/catalog?filter=sale"
            image={heroImage}
            variant="primary"
          />
        </Link>
      </section>

      {/* Categories - 2.8, 2.9 */}
      <section className="pt-6">
        <CategoryChipsCarousel initialExpanded={true} />
      </section>

      {/* Popular Products - 1 row, collapsible */}
      <section className="pt-6">
        <CollapsibleSection title="Популярные товары" linkText="Все" linkTo="/catalog" initialExpanded={true}>
          <ProductCarousel products={mockProducts.slice(0, 12)} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Farm Products - 1 row, collapsible */}
      <section className="pt-6">
        <CollapsibleSection title="Фермерские/Эко продукты" linkText="Все" linkTo="/farm-products" initialExpanded={true}>
          <ProductCarousel products={farmProducts} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Sale Products - 1 row, collapsible */}
      <section className="pt-6">
        <CollapsibleSection title="Акции" linkText="Все" linkTo="/catalog?filter=sale" initialExpanded={true}>
          <ProductCarousel products={[...saleProducts, ...mockProducts.slice(0, 4)]} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Banner: Готовые блюда и рационы */}
      <section className="px-4 pt-6">
        <Link to="/ready-meals">
          <PromoBanner
            title="Готовые блюда и рационы питания"
            subtitle="Экономьте время на готовку!"
            buttonText="Подробнее"
            buttonLink="/ready-meals"
            image={mockRecipes[1]?.image || heroImage}
            variant="accent"
          />
        </Link>
      </section>

      {/* Popular Meals - 1 row, collapsible */}
      <section className="pt-6">
        <CollapsibleSection title="Популярные блюда" linkText="Все" linkTo="/ready-meals?tab=meals" initialExpanded={true}>
          <MealCarousel meals={readyMeals} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Meal Plans - 1 row, collapsible */}
      <section className="pt-6">
        <CollapsibleSection title="Готовые рационы" linkText="Все" linkTo="/ready-meals?tab=plans" initialExpanded={true}>
          <MealPlanCarousel plans={mealPlans} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Banner: Клуб Кулинаров - 2.15 */}
      <section className="px-4 pt-6">
        <Link to="/social-recipes">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👨‍🍳</span>
                <div>
                  <h3 className="text-xl font-bold text-white">Клуб Кулинаров</h3>
                  <p className="text-white/80 text-sm">Челленджи, рейтинги, призы</p>
                </div>
                <ChevronRight className="h-6 w-6 text-white ml-auto" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Catering - 2.16 (3 rows carousel) */}
      <section className="pt-6 pb-8">
        <SectionHeader title="Кейтеринг" linkText="Все" linkTo="/catering" />
        <CateringCarousel offers={cateringOffers} rows={3} />
      </section>
    </div>
  );
}
