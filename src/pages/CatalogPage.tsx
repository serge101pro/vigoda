import { useState, useMemo } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { 
  mockProducts, 
  categories, 
  cosmeticsCategories,
  householdCategories 
} from '@/data/mockData';
import { 
  perfumeCategories, 
  perfumeProducts,
  extendedHouseholdCategories,
  extendedHouseholdProducts,
  accessoriesCategories,
  accessoriesProducts
} from '@/data/extendedMockData';
import { petCategories, petProducts } from '@/data/petData';

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
  { id: 'pets', label: 'Для питомцев', emoji: '🐾', image: accessoriesImage, color: 'bg-amber-500/10' },
];

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export default function CatalogPage() {
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState(section || 'products');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [minRating, setMinRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get products and categories based on active section
  const getProductsForSection = () => {
    switch (activeSection) {
      case 'beauty':
        return mockProducts; // Use cosmetics data
      case 'perfume':
        return perfumeProducts;
      case 'household':
        return extendedHouseholdProducts;
      case 'accessories':
        return accessoriesProducts;
      case 'pets':
        return petProducts;
      default:
        return mockProducts;
    }
  };

  const getCategoriesForSection = () => {
    switch (activeSection) {
      case 'beauty':
        return cosmeticsCategories;
      case 'perfume':
        return perfumeCategories;
      case 'household':
        return extendedHouseholdCategories;
      case 'accessories':
        return accessoriesCategories;
      case 'pets':
        return petCategories;
      default:
        return categories;
    }
  };

  const currentProducts = getProductsForSection();
  const currentCategories = getCategoriesForSection();

  // Calculate max price for current products
  const maxPrice = useMemo(() => {
    return Math.max(...currentProducts.map(p => p.price), 30000);
  }, [currentProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...currentProducts];

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by rating
    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }

    return result;
  }, [currentProducts, activeCategory, searchQuery, priceRange, minRating, sortBy]);

  const resetFilters = () => {
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setIsFilterOpen(false);
  };

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < maxPrice || minRating > 0;

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
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${hasActiveFilters ? 'text-primary' : ''}`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Цена: {priceRange[0]} ₽ — {priceRange[1]} ₽
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={0}
                      max={maxPrice}
                      step={100}
                      className="mt-2"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Минимальный рейтинг
                    </label>
                    <div className="flex gap-2">
                      {[0, 3, 4, 4.5].map((rating) => (
                        <Button
                          key={rating}
                          variant={minRating === rating ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMinRating(rating)}
                        >
                          {rating === 0 ? 'Все' : `${rating}+`}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Reset */}
                  {hasActiveFilters && (
                    <Button variant="outline" className="w-full" onClick={resetFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Сбросить фильтры
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">По популярности</SelectItem>
                <SelectItem value="price-asc">Сначала дешёвые</SelectItem>
                <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                <SelectItem value="rating">По рейтингу</SelectItem>
              </SelectContent>
            </Select>
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
          Найдено: {filteredAndSortedProducts.length} товаров
        </p>
        <div className="grid grid-cols-2 gap-3">
          {filteredAndSortedProducts.map((product, index) => (
            <div key={product.id} className={`stagger-${(index % 5) + 1}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-foreground mb-2">
              Ничего не найдено
            </p>
            <p className="text-muted-foreground">
              Попробуйте изменить параметры поиска
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
