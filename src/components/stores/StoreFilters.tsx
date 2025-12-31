import { useState } from 'react';
import { Filter, Clock, Store, Wheat, ShoppingCart, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export type StoreType = 'all' | 'grocery' | 'hypermarket' | 'farm' | 'discount';

interface StoreFiltersProps {
  selectedTypes: StoreType[];
  onTypesChange: (types: StoreType[]) => void;
  onlyOpenNow: boolean;
  onOnlyOpenNowChange: (open: boolean) => void;
  openUntilHour: number | null;
  onOpenUntilHourChange: (hour: number | null) => void;
}

const storeTypes = [
  { id: 'all' as StoreType, label: 'Все', icon: Store },
  { id: 'grocery' as StoreType, label: 'Продуктовые', icon: ShoppingCart },
  { id: 'hypermarket' as StoreType, label: 'Гипермаркеты', icon: Building2 },
  { id: 'farm' as StoreType, label: 'Фермерские', icon: Wheat },
  { id: 'discount' as StoreType, label: 'Дискаунтеры', icon: Store },
];

const openUntilOptions = [
  { value: null, label: 'Любое' },
  { value: 21, label: 'до 21:00' },
  { value: 22, label: 'до 22:00' },
  { value: 23, label: 'до 23:00' },
  { value: 24, label: 'Круглосуточно' },
];

export function StoreFilters({
  selectedTypes,
  onTypesChange,
  onlyOpenNow,
  onOnlyOpenNowChange,
  openUntilHour,
  onOpenUntilHourChange,
}: StoreFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleType = (type: StoreType) => {
    if (type === 'all') {
      onTypesChange(['all']);
      return;
    }
    
    let newTypes = selectedTypes.filter(t => t !== 'all');
    
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }
    
    if (newTypes.length === 0) {
      onTypesChange(['all']);
    } else {
      onTypesChange(newTypes);
    }
  };

  const hasActiveFilters = !selectedTypes.includes('all') || onlyOpenNow || openUntilHour !== null;

  return (
    <div className="flex items-center gap-2">
      {/* Quick type filters */}
      <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide">
        {storeTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedTypes.includes(type.id);
          
          return (
            <Badge
              key={type.id}
              variant={isSelected ? 'default' : 'outline'}
              className={`cursor-pointer whitespace-nowrap flex items-center gap-1 px-3 py-1.5 ${
                isSelected ? '' : 'hover:bg-muted'
              }`}
              onClick={() => toggleType(type.id)}
            >
              <Icon className="h-3 w-3" />
              {type.label}
            </Badge>
          );
        })}
      </div>

      {/* Advanced filters sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative flex-shrink-0">
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Фильтры магазинов</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 py-4">
            {/* Open now */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="open-now">Открыто сейчас</Label>
              </div>
              <Switch
                id="open-now"
                checked={onlyOpenNow}
                onCheckedChange={onOnlyOpenNowChange}
              />
            </div>

            {/* Open until */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Работает до
              </Label>
              <div className="flex flex-wrap gap-2">
                {openUntilOptions.map((option) => (
                  <Badge
                    key={option.value ?? 'any'}
                    variant={openUntilHour === option.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => onOpenUntilHourChange(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reset button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onTypesChange(['all']);
                  onOnlyOpenNowChange(false);
                  onOpenUntilHourChange(null);
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Helper function to check if store is open
export function isStoreOpen(workingHours: string): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Parse working hours like "08:00 - 23:00"
  const match = workingHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!match) return true;
  
  const [, openHour, openMin, closeHour, closeMin] = match.map(Number);
  const currentTime = currentHour * 60 + currentMinute;
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime < closeTime;
}

// Helper function to get closing hour
export function getClosingHour(workingHours: string): number | null {
  const match = workingHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!match) return null;
  return parseInt(match[3], 10);
}

// Helper function to get store type
export function getStoreType(storeId: string): StoreType {
  const hypermarkets = ['lenta', 'auchan', 'metro'];
  const discounters = ['svetofor'];
  const farmStores = ['vkusvill'];
  
  if (hypermarkets.includes(storeId)) return 'hypermarket';
  if (discounters.includes(storeId)) return 'discount';
  if (farmStores.includes(storeId)) return 'farm';
  return 'grocery';
}
