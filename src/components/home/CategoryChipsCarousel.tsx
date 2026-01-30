import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Import category icons
import categoryDairy from '@/assets/icons/category-dairy.png';
import categoryEggs from '@/assets/icons/category-eggs.png';
import categoryCheese from '@/assets/icons/category-cheese.png';
import categoryMeat from '@/assets/icons/category-meat.png';
import categoryPoultry from '@/assets/icons/category-poultry.png';
import categoryFish from '@/assets/icons/category-fish.png';
import categorySeafood from '@/assets/icons/category-seafood.png';
import categoryVegetables from '@/assets/icons/category-vegetables.png';
import categoryFruits from '@/assets/icons/category-fruits.png';
import categoryGreens from '@/assets/icons/category-greens.png';
import categoryNuts from '@/assets/icons/category-nuts.png';
import categoryFrozen from '@/assets/icons/category-frozen.png';
import categorySausages from '@/assets/icons/category-sausages.png';
import categoryBread from '@/assets/icons/category-bread.png';
import categoryBakery from '@/assets/icons/category-bakery.png';
import categoryGrocery from '@/assets/icons/category-grocery.png';
import categorySweets from '@/assets/icons/category-sweets.png';
import categorySnacks from '@/assets/icons/category-snacks.png';
import categoryDriedFruits from '@/assets/icons/category-dried-fruits.png';
import categoryTea from '@/assets/icons/category-tea.png';
import categoryCoffee from '@/assets/icons/category-coffee.png';
import categoryDrinks from '@/assets/icons/category-drinks.png';
import categoryWater from '@/assets/icons/category-water.png';
import categoryJuice from '@/assets/icons/category-juice.png';

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

const productCategories: Category[] = [
  { id: '1', name: 'Молочные продукты', icon: categoryDairy, slug: 'dairy' },
  { id: '2', name: 'Яйца', icon: categoryEggs, slug: 'eggs' },
  { id: '3', name: 'Сыр', icon: categoryCheese, slug: 'cheese' },
  { id: '4', name: 'Мясо', icon: categoryMeat, slug: 'meat' },
  { id: '5', name: 'Птица', icon: categoryPoultry, slug: 'poultry' },
  { id: '6', name: 'Рыба, икра', icon: categoryFish, slug: 'fish' },
  { id: '7', name: 'Морепродукты', icon: categorySeafood, slug: 'seafood' },
  { id: '8', name: 'Овощи', icon: categoryVegetables, slug: 'vegetables' },
  { id: '9', name: 'Фрукты', icon: categoryFruits, slug: 'fruits' },
  { id: '10', name: 'Зелень', icon: categoryGreens, slug: 'greens' },
  { id: '11', name: 'Орехи', icon: categoryNuts, slug: 'nuts' },
  { id: '12', name: 'Заморозка', icon: categoryFrozen, slug: 'frozen' },
  { id: '13', name: 'Колбасы', icon: categorySausages, slug: 'sausages' },
  { id: '14', name: 'Хлеб', icon: categoryBread, slug: 'bread' },
  { id: '15', name: 'Выпечка', icon: categoryBakery, slug: 'bakery' },
  { id: '16', name: 'Бакалея', icon: categoryGrocery, slug: 'grocery' },
  { id: '17', name: 'Сладости', icon: categorySweets, slug: 'sweets' },
  { id: '18', name: 'Чипсы, снеки', icon: categorySnacks, slug: 'snacks' },
  { id: '19', name: 'Сухофрукты', icon: categoryDriedFruits, slug: 'dried-fruits' },
  { id: '20', name: 'Чай', icon: categoryTea, slug: 'tea' },
  { id: '21', name: 'Кофе', icon: categoryCoffee, slug: 'coffee' },
  { id: '22', name: 'Напитки', icon: categoryDrinks, slug: 'drinks' },
  { id: '23', name: 'Вода', icon: categoryWater, slug: 'water' },
  { id: '24', name: 'Соки', icon: categoryJuice, slug: 'juice' },
];

interface CategoryChipsCarouselProps {
  initialExpanded?: boolean;
}

export function CategoryChipsCarousel({ initialExpanded = true }: CategoryChipsCarouselProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Sync with prop changes (for global collapse toggle)
  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  // Split categories into 2 rows for carousel
  const row1 = productCategories.slice(0, 12);
  const row2 = productCategories.slice(12, 24);

  return (
    <div className="space-y-3">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-foreground">Категории</h2>
        <div className="flex items-center gap-2">
          <Link to="/catalog" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
            Все
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="space-y-2">
          {/* Row 1 */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {row1.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted transition-all"
              >
                <img 
                  src={cat.icon} 
                  alt={cat.name} 
                  className="w-8 h-8 object-contain rounded"
                />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {row2.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted transition-all"
              >
                <img 
                  src={cat.icon} 
                  alt={cat.name} 
                  className="w-8 h-8 object-contain rounded"
                />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
