import { useState } from 'react';
import { Search, Heart, ChefHat, ChevronRight, Store, Tractor, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PromoBanner } from '@/components/ui/PromoBanner';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { MealCarousel } from '@/components/home/MealCarousel';
import { MealPlanCarousel } from '@/components/home/MealPlanCarousel';
import { CateringCarousel } from '@/components/home/CateringCarousel';
import { FarmProductCarousel } from '@/components/home/FarmProductCarousel';
import { VoiceSearch } from '@/components/home/VoiceSearch';
import { PromoBannerCarousel } from '@/components/home/PromoBannerCarousel';
import { CategoryChipsCarousel } from '@/components/home/CategoryChipsCarousel';
import { HeaderAvatar } from '@/components/home/HeaderAvatar';
import { AddressDropdown } from '@/components/home/AddressDropdown';
import { BusinessWidget } from '@/components/home/BusinessWidget';
import { ReferralBanner } from '@/components/home/ReferralBanner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Switch } from '@/components/ui/switch';
import { mockProducts, mockRecipes } from '@/data/mockData';
import { homeCateringOffers, officeCateringOffers, themedCateringOffers } from '@/data/cateringData';
import { farmProducts } from '@/data/farmData';
import { petProducts, popularPetProducts } from '@/data/petData';
import { PetProductCarousel } from '@/components/home/PetProductCarousel';
import heroImage from '@/assets/hero-groceries.jpg';
import mealPlanBalanced from '@/assets/meals/meal-plan-balanced.jpg';
import mealPlanDiet from '@/assets/meals/meal-plan-diet.jpg';
import mealPlanMuscle from '@/assets/meals/meal-plan-muscle.jpg';
import mealPlanVegan from '@/assets/meals/meal-plan-vegan.jpg';
import chickenQuinoaHd from '@/assets/meals/chicken-quinoa-hd.jpg';
import salmonTeriyakiHd from '@/assets/meals/salmon-teriyaki-hd.jpg';
import greekSaladHd from '@/assets/meals/greek-salad-hd.jpg';
import borschtHd from '@/assets/meals/borscht-hd.jpg';
import carbonaraHd from '@/assets/meals/carbonara-hd.jpg';
import oatmealBerriesHd from '@/assets/meals/oatmeal-berries-hd.jpg';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from '@/lib/i18n';

const monthNames = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
const currentMonth = monthNames[new Date().getMonth()];

const saleProducts = mockProducts.filter(p => p.badge === 'sale' || p.badge === 'hot');

const readyMeals = [
  { id: '1', name: 'Куриная грудка с киноа', image: chickenQuinoaHd, weight: 350, calories: 420, protein: 38, price: 449, oldPrice: 549, rating: 4.8 },
  { id: '2', name: 'Лосось терияки с рисом', image: salmonTeriyakiHd, weight: 380, calories: 520, protein: 32, price: 649, rating: 4.9 },
  { id: '3', name: 'Греческий салат с фетой', image: greekSaladHd, weight: 250, calories: 280, protein: 8, price: 349, oldPrice: 399, rating: 4.6 },
  { id: '4', name: 'Борщ со сметаной', image: borschtHd, weight: 400, calories: 320, protein: 18, price: 299, rating: 4.7 },
  { id: '5', name: 'Паста Карбонара', image: carbonaraHd, weight: 320, calories: 580, protein: 22, price: 399, rating: 4.8 },
  { id: '6', name: 'Овсянка с ягодами', image: oatmealBerriesHd, weight: 280, calories: 340, protein: 12, price: 249, rating: 4.5 },
];

const mealPlans = [
  { id: '1', name: 'Сбалансированное питание', image: mealPlanBalanced, days: 7, mealsPerDay: 5, caloriesPerDay: 1800, price: 6990, pricePerDay: 999, discount: 15, rating: 4.9, isPopular: true },
  { id: '2', name: 'Похудение без голода', image: mealPlanDiet, days: 14, mealsPerDay: 5, caloriesPerDay: 1400, price: 11990, pricePerDay: 857, discount: 20, rating: 4.8 },
  { id: '3', name: 'Набор массы', image: mealPlanMuscle, days: 7, mealsPerDay: 6, caloriesPerDay: 2800, price: 8990, pricePerDay: 1284, rating: 4.7 },
  { id: '4', name: 'Вегетарианский', image: mealPlanVegan, days: 7, mealsPerDay: 4, caloriesPerDay: 1600, price: 5990, pricePerDay: 856, rating: 4.6 },
];

// Combine catering offers for different rows
const cateringHomeOffers = homeCateringOffers.map(o => ({ ...o, category: 'home' as const }));
const cateringOfficeOffers = officeCateringOffers.map(o => ({ ...o, category: 'office' as const }));
const cateringThemedOffers = themedCateringOffers.map(o => ({ ...o, category: 'themed' as const }));

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { hasPaidPlan } = useSubscription();
  const { allSectionsCollapsed, setAllSectionsCollapsed } = useAppStore();

  const savings = profile?.total_savings || 2450;
  const bonusPoints = profile?.bonus_points || 1280;

  const handleVoiceResult = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HeaderAvatar />
              <AddressDropdown />
            </div>
            <div className="flex items-center gap-1">
              <Link to="/nearest-stores">
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                  <MapPin className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/favorites">
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Referral Banner */}
      <ReferralBanner />

      {/* Promo Banner Carousel */}
      <section className="px-4 pt-4">
        <PromoBannerCarousel />
      </section>

      {/* Search with voice input */}
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

      {/* Stats Cards Row */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
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

      {/* Banner: Скидки дня */}
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
        
        {/* Compact Expand/Collapse Toggle */}
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-xs text-muted-foreground">
            {allSectionsCollapsed ? 'Развернуть' : 'Свернуть'} все
          </span>
          <Switch
            checked={!allSectionsCollapsed}
            onCheckedChange={(checked) => setAllSectionsCollapsed(!checked)}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="pt-6">
        <CategoryChipsCarousel initialExpanded={!allSectionsCollapsed} />
      </section>

      {/* Popular Products */}
      <section className="pt-6">
        <CollapsibleSection title="Популярные товары" linkText="Все" linkTo="/catalog" initialExpanded={!allSectionsCollapsed}>
          <ProductCarousel products={mockProducts.slice(0, 12)} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Farm Products */}
      <section className="pt-6">
        <CollapsibleSection title="Фермерские/Эко продукты" linkText="Все" linkTo="/farm-products" initialExpanded={!allSectionsCollapsed}>
          <FarmProductCarousel products={farmProducts} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Sale Products */}
      <section className="pt-6">
        <CollapsibleSection title="Акции" linkText="Все" linkTo="/promos" initialExpanded={!allSectionsCollapsed}>
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
            image={chickenQuinoaHd}
            variant="accent"
          />
        </Link>
      </section>

      {/* Popular Meals */}
      <section className="pt-6">
        <CollapsibleSection title="Популярные блюда" linkText="Все" linkTo="/ready-meals?tab=meals" initialExpanded={!allSectionsCollapsed}>
          <MealCarousel meals={readyMeals} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Meal Plans */}
      <section className="pt-6">
        <CollapsibleSection title="Готовые рационы" linkText="Все" linkTo="/ready-meals?tab=plans" initialExpanded={!allSectionsCollapsed}>
          <MealPlanCarousel plans={mealPlans} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Catering - Moved after Meal Plans */}
      <section className="pt-6">
        <CollapsibleSection title="Кейтеринг" linkText="Все" linkTo="/catering" initialExpanded={!allSectionsCollapsed}>
          <div className="space-y-4">
            <div>
              <p className="px-4 text-sm font-medium text-muted-foreground mb-2">🏠 На дом</p>
              <CateringCarousel offers={cateringHomeOffers} rows={1} />
            </div>
            <div>
              <p className="px-4 text-sm font-medium text-muted-foreground mb-2">🏢 В офис</p>
              <CateringCarousel offers={cateringOfficeOffers} rows={1} />
            </div>
            <div>
              <p className="px-4 text-sm font-medium text-muted-foreground mb-2">🎉 Тематические</p>
              <CateringCarousel offers={cateringThemedOffers} rows={1} />
            </div>
          </div>
        </CollapsibleSection>
      </section>

      {/* Banner: Клуб Кулинаров */}
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

      {/* Магазины и Фермы */}
      <section className="px-4 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/stores" className="block">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
              <Store className="h-8 w-8 mb-2" />
              <h3 className="font-bold">Магазины</h3>
              <p className="text-sm text-white/80">Сетевые и локальные</p>
              <ChevronRight className="h-5 w-5 mt-2" />
            </div>
          </Link>
          <Link to="/farms" className="block">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
              <Tractor className="h-8 w-8 mb-2" />
              <h3 className="font-bold">Фермы</h3>
              <p className="text-sm text-white/80">Свежее от фермеров</p>
              <ChevronRight className="h-5 w-5 mt-2" />
            </div>
          </Link>
        </div>
      </section>

      {/* Business Widget */}
      <section className="px-4 pt-6">
        <BusinessWidget />
      </section>

      {/* Для питомцев */}
      <section className="pt-6">
        <CollapsibleSection title="Для питомцев" linkText="Все" linkTo="/catalog/pets" initialExpanded={!allSectionsCollapsed}>
          <PetProductCarousel products={petProducts.slice(0, 8)} rows={1} />
        </CollapsibleSection>
      </section>

      {/* Популярное для питомцев */}
      <section className="pt-6 pb-8">
        <CollapsibleSection title="Популярное для питомцев" linkText="Все" linkTo="/catalog/pets" initialExpanded={!allSectionsCollapsed}>
          <PetProductCarousel products={popularPetProducts} rows={1} />
        </CollapsibleSection>
      </section>
    </div>
  );
}
