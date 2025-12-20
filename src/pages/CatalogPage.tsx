import { useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  mockProducts, 
  categories, 
  cosmeticsProducts, 
  cosmeticsCategories,
  householdProducts,
  householdCategories 
} from '@/data/mockData';

// Import local images
import productsImage from '@/assets/catalog/products.jpg';
import beautyImage from '@/assets/catalog/beauty.jpg';
import householdImage from '@/assets/catalog/household.jpg';
import accessoriesImage from '@/assets/catalog/accessories.jpg';

const catalogSections = [
  { id: 'products', label: 'Продукты', emoji: '🛒', image: productsImage, color: 'bg-green-500/10' },
  { id: 'beauty', label: 'Косметика', emoji: '💄', image: beautyImage, color: 'bg-pink-500/10' },
  { id: 'perfume', label: 'Парфюмерия', emoji: '🌸', image: beautyImage, color: 'bg-purple-500/10' },
  { id: 'household', label: 'Бытовая химия', emoji: '🧹', image: householdImage, color: 'bg-blue-500/10' },
  { id: 'accessories', label: 'Хоз. мелочи', emoji: '🧰', image: accessoriesImage, color: 'bg-orange-500/10' },
];

export default function CatalogPage() {
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState(section || 'products');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

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

        </div>
      </header>

      {/* Main Categories Section - styled like HomePage */}
      <section className="pt-4 space-y-3">
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-bold text-foreground">Категории</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
            className="h-8 w-8 p-0"
          >
            {isCategoriesExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Collapsible content */}
        {isCategoriesExpanded && (
          <div className="space-y-2">
            {/* Main Catalog Sections Row */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
              {catalogSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    setActiveCategory('all');
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-card border rounded-xl transition-all ${
                    activeSection === s.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Subcategories Row */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
              {currentCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-card border rounded-xl transition-all ${
                    activeCategory === cat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
