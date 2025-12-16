import { useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  mockProducts, 
  categories, 
  cosmeticsProducts, 
  cosmeticsCategories,
  householdProducts,
  householdCategories 
} from '@/data/mockData';

const catalogSections = [
  { id: 'products', label: 'Продукты', emoji: '🛒', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop&q=80' },
  { id: 'beauty', label: 'Косметика', emoji: '💄', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop&q=80' },
  { id: 'household', label: 'Бытовая химия', emoji: '🧹', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=200&fit=crop&q=80' },
  { id: 'accessories', label: 'Хоз. мелочи', emoji: '🧰', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=200&fit=crop&q=80' },
];

export default function CatalogPage() {
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState(section || 'products');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get products and categories based on active section
  const getProductsForSection = () => {
    switch (activeSection) {
      case 'beauty':
        return cosmeticsProducts;
      case 'household':
      case 'accessories':
        return householdProducts;
      default:
        return mockProducts;
    }
  };

  const getCategoriesForSection = () => {
    switch (activeSection) {
      case 'beauty':
        return cosmeticsCategories;
      case 'household':
      case 'accessories':
        return householdCategories;
      default:
        return categories;
    }
  };

  const currentProducts = getProductsForSection();
  const currentCategories = getCategoriesForSection();

  const filteredProducts =
    activeCategory === 'all'
      ? currentProducts
      : currentProducts.filter((p) => p.category === activeCategory);

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
              <Button variant="ghost" size="icon">
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
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {catalogSections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  setActiveCategory('all');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
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

      {/* Section Banner */}
      <section className="px-4 pt-4">
        <div className="relative h-32 rounded-2xl overflow-hidden">
          <img 
            src={catalogSections.find(s => s.id === activeSection)?.image}
            alt={catalogSections.find(s => s.id === activeSection)?.label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent flex items-center p-4">
            <div>
              <span className="text-3xl mb-2 block">
                {catalogSections.find(s => s.id === activeSection)?.emoji}
              </span>
              <h2 className="text-xl font-bold text-foreground">
                {catalogSections.find(s => s.id === activeSection)?.label}
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pt-4">
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {currentCategories.map((cat) => (
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
