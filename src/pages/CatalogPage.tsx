import { useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, categories } from '@/data/mockData';

const catalogSections = [
  { id: 'products', label: 'Продукты', emoji: '🛒' },
  { id: 'beauty', label: 'Косметика', emoji: '💄' },
  { id: 'household', label: 'Бытовая химия', emoji: '🧹' },
];

export default function CatalogPage() {
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState(section || 'products');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts =
    activeCategory === 'all'
      ? mockProducts
      : mockProducts.filter((p) => p.category === activeCategory);

  const searchFilteredProducts = searchQuery
    ? filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Каталог</h1>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск в каталоге..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search pr-12"
            />
            <Button variant="ghost" size="icon-sm" className="absolute right-2 top-1/2 -translate-y-1/2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2">
            {catalogSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeSection === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Categories */}
      <section className="pt-4">
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

      {/* Products Grid */}
      <section className="px-4 pt-4 pb-8">
        <p className="text-sm text-muted-foreground mb-4">
          Найдено: {searchFilteredProducts.length} товаров
        </p>
        <div className="grid grid-cols-2 gap-3">
          {searchFilteredProducts.map((product, index) => (
            <div key={product.id} className={`stagger-${(index % 5) + 1}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {searchFilteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-foreground mb-2">
              Ничего не найдено
            </p>
            <p className="text-muted-foreground">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
