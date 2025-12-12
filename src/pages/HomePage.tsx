import { useState } from 'react';
import { Search, MapPin, Bell, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { PromoBanner } from '@/components/ui/PromoBanner';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, mockRecipes, categories } from '@/data/mockData';
import heroImage from '@/assets/hero-groceries.jpg';
import { Clock, Users, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts =
    activeCategory === 'all'
      ? mockProducts
      : mockProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">В</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Доставка в</p>
                <button className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Москва, Центр</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search"
            />
            <Button variant="ghost" size="icon-sm" className="absolute right-2 top-1/2 -translate-y-1/2">
              <Mic className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Promo Banner */}
      <section className="px-4 pt-4">
        <PromoBanner
          title="Скидки до 30% на свежие продукты"
          subtitle="Только сегодня!"
          buttonText="Смотреть"
          buttonLink="/catalog"
          image={heroImage}
          variant="primary"
        />
      </section>

      {/* Categories */}
      <section className="pt-6">
        <SectionHeader title="Категории" linkText="Все" linkTo="/catalog" />
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              emoji={cat.emoji}
              label={cat.label}
              color={cat.color}
              isActive={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="pt-6">
        <SectionHeader title="Популярные товары" linkText="Все" linkTo="/catalog" />
        <div className="grid grid-cols-2 gap-3 px-4">
          {filteredProducts.slice(0, 4).map((product, index) => (
            <div key={product.id} className={`stagger-${index + 1}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Recipes */}
      <section className="pt-6 pb-6">
        <SectionHeader title="Рецепты" linkText="Все" linkTo="/recipes" />
        <div className="flex gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {mockRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recipes/${recipe.id}`}
              className="flex-shrink-0 w-64 animate-fade-in"
            >
              <div className="card-product">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {recipe.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{recipe.time} мин</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" />
                    <span>{recipe.calories} ккал</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{recipe.servings} порц.</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Second Promo */}
      <section className="px-4 pb-6">
        <PromoBanner
          title="Готовые рационы на неделю"
          subtitle="Экономьте время!"
          buttonText="Подробнее"
          buttonLink="/recipes/rations"
          image={mockRecipes[1]?.image || heroImage}
          variant="accent"
        />
      </section>

      {/* Sale Products */}
      <section className="pb-8">
        <SectionHeader title="Акции" linkText="Все" linkTo="/catalog?filter=sale" />
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {mockProducts
            .filter((p) => p.badge === 'sale')
            .map((product) => (
              <div key={product.id} className="flex-shrink-0 w-44">
                <ProductCard product={product} />
              </div>
            ))}
          {mockProducts
            .filter((p) => p.badge === 'hot')
            .map((product) => (
              <div key={product.id} className="flex-shrink-0 w-44">
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
