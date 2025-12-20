import { X, Star, Flame, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Period {
  months: number;
  label: string;
  pricePerMonth: number;
  total: number;
  discount?: number;
  savings?: number;
  badge?: 'promo' | 'popular' | 'best';
  note?: string;
}

interface PeriodModalProps {
  open: boolean;
  onClose: () => void;
  planType: 'solo' | 'family';
  onSelect?: (period: Period) => void;
}

const soloPeriods: Period[] = [
  { months: 1, label: '1 месяц', pricePerMonth: 399, total: 399 },
  { months: 3, label: '3 месяца', pricePerMonth: 379, total: 1137, discount: 5, savings: 60, badge: 'promo' },
  { months: 6, label: '6 месяцев', pricePerMonth: 349, total: 2094, discount: 13, savings: 300, badge: 'popular', note: 'Популярный выбор!' },
  { months: 12, label: '1 год', pricePerMonth: 299, total: 3588, discount: 25, savings: 1200, badge: 'best', note: 'Как 3 месяца бесплатно!' },
];

const familyPeriods: Period[] = [
  { months: 1, label: '1 месяц', pricePerMonth: 499, total: 499 },
  { months: 3, label: '3 месяца', pricePerMonth: 479, total: 1437, discount: 4, savings: 60 },
  { months: 6, label: '6 месяцев', pricePerMonth: 449, total: 2694, discount: 10, savings: 300, badge: 'popular', note: 'Популярный' },
  { months: 12, label: '1 год', pricePerMonth: 399, total: 4788, discount: 20, savings: 1200, badge: 'best', note: 'Экономия 1,200₽ в год!' },
];

export function PeriodModal({ open, onClose, planType, onSelect }: PeriodModalProps) {
  const periods = planType === 'solo' ? soloPeriods : familyPeriods;
  const navigate = useNavigate();

  const handlePeriodSelect = (period: Period) => {
    onClose();
    navigate(`/payment?plan=${planType}&months=${period.months}&amount=${period.total}`);
  };

  const getBadge = (badge?: 'promo' | 'popular' | 'best') => {
    switch (badge) {
      case 'promo':
        return <Badge className="bg-primary text-primary-foreground">Промо</Badge>;
      case 'popular':
        return <Badge className="bg-accent text-accent-foreground"><Star className="h-3 w-3 mr-1" />Рекомендуем</Badge>;
      case 'best':
        return <Badge className="bg-accent text-accent-foreground"><Flame className="h-3 w-3 mr-1" />Лучшая цена</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              Премиум {planType === 'solo' ? 'Solo' : 'Family'}
            </DialogTitle>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {periods.map((period) => (
            <button
              key={period.months}
              onClick={() => handlePeriodSelect(period)}
              className={`relative w-full text-left rounded-2xl p-4 border-2 transition-all hover:border-primary ${
                period.badge === 'popular' || period.badge === 'best'
                  ? 'border-primary/30 bg-primary-light/30'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {period.badge && (
                <div className="absolute -top-2 right-4">
                  {getBadge(period.badge)}
                </div>
              )}
              
              <p className="font-semibold">{period.label}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {period.pricePerMonth}₽<span className="text-sm font-normal text-muted-foreground">/месяц</span>
              </p>
              <p className="text-sm text-muted-foreground">Итого: {period.total}₽</p>
              
              {period.discount && (
                <Badge className="mt-2 bg-primary text-primary-foreground">
                  -{period.discount}% · Экономия {period.savings}₽
                </Badge>
              )}
              
              {period.note && (
                <p className="text-sm text-primary font-semibold mt-2">{period.note}</p>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-primary" />
            Отменить в любой момент
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-primary" />
            14 дней money-back гарантия
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
