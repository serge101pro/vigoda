import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  emoji: string;
  slug: string;
}

const productCategories: Category[] = [
  { id: '1', name: 'Молочные продукты', emoji: '🥛', slug: 'dairy' },
  { id: '2', name: 'Яйца', emoji: '🥚', slug: 'eggs' },
  { id: '3', name: 'Сыр', emoji: '🧀', slug: 'cheese' },
  { id: '4', name: 'Мясо', emoji: '🥩', slug: 'meat' },
  { id: '5', name: 'Птица', emoji: '🍗', slug: 'poultry' },
  { id: '6', name: 'Рыба, икра', emoji: '🐟', slug: 'fish' },
  { id: '7', name: 'Морепродукты', emoji: '🦐', slug: 'seafood' },
  { id: '8', name: 'Овощи', emoji: '🥦', slug: 'vegetables' },
  { id: '9', name: 'Фрукты', emoji: '🍎', slug: 'fruits' },
  { id: '10', name: 'Зелень', emoji: '🥬', slug: 'greens' },
  { id: '11', name: 'Орехи', emoji: '🥜', slug: 'nuts' },
  { id: '12', name: 'Заморозка', emoji: '❄️', slug: 'frozen' },
  { id: '13', name: 'Колбасы', emoji: '🌭', slug: 'sausages' },
  { id: '14', name: 'Хлеб', emoji: '🍞', slug: 'bread' },
  { id: '15', name: 'Выпечка', emoji: '🥐', slug: 'bakery' },
  { id: '16', name: 'Бакалея', emoji: '🫘', slug: 'grocery' },
  { id: '17', name: 'Сладости', emoji: '🍫', slug: 'sweets' },
  { id: '18', name: 'Чипсы, снеки', emoji: '🍿', slug: 'snacks' },
  { id: '19', name: 'Сухофрукты', emoji: '🍇', slug: 'dried-fruits' },
  { id: '20', name: 'Чай', emoji: '🍵', slug: 'tea' },
  { id: '21', name: 'Кофе', emoji: '☕', slug: 'coffee' },
  { id: '22', name: 'Напитки', emoji: '🧃', slug: 'drinks' },
  { id: '23', name: 'Вода', emoji: '💧', slug: 'water' },
  { id: '24', name: 'Соки', emoji: '🧃', slug: 'juice' },
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
        <h2 className="text-lg font-bold text-foreground">Продукты</h2>
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
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted transition-all"
              >
                <span className="text-lg">{cat.emoji}</span>
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
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted transition-all"
              >
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
