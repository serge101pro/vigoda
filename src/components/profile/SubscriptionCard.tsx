import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SubscriptionCardProps {
  type: 'free' | 'solo' | 'family' | 'corp';
  isCurrentPlan?: boolean;
  isRecommended?: boolean;
  onSelectPeriod?: () => void;
  onContact?: () => void;
}

interface PlanDetail {
  name: string;
  price: string;
  priceLabel?: string;
  features: string[];
  note?: string;
}

const planDetails: Record<'free' | 'solo' | 'family' | 'corp', PlanDetail> = {
  free: {
    name: 'Выгода',
    price: 'Бесплатно',
    features: [
      'До 3 активных списков',
      '2-3 магазина',
      'С рекламой',
      'Без отправки списков'
    ]
  },
  solo: {
    name: 'Персона',
    price: 'от 299₽',
    priceLabel: '/месяц',
    features: [
      'Неограниченные списки',
      'Все магазины',
      'Без рекламы',
      'Отправка списков',
      'Голосовой ввод',
      'Предсказания AI'
    ]
  },
  family: {
    name: 'Семья',
    price: 'от 399₽',
    priceLabel: '/месяц',
    features: [
      'До 5 участников',
      'Всё из Персона +',
      'Real-time синхронизация',
      'Семейный бюджет',
      'Meal planning'
    ],
    note: 'Далее 59₽/чел/мес'
  },
  corp: {
    name: 'Бизнес',
    price: '99₽',
    priceLabel: '/участник/месяц',
    features: [
      'От 1 участника',
      'Всё из Семья +',
      'Корп. отчёты',
      'API доступ'
    ],
    note: 'Корпоративный тариф'
  }
};

export function SubscriptionCard({ 
  type, 
  isCurrentPlan, 
  isRecommended,
  onSelectPeriod, 
  onContact 
}: SubscriptionCardProps) {
  const plan = planDetails[type];
  
  return (
    <div className={`relative rounded-2xl p-4 border-2 transition-all ${
      isCurrentPlan 
        ? 'border-primary bg-primary-light' 
        : isRecommended 
          ? 'border-accent bg-accent-light/50' 
          : 'border-border bg-card'
    }`}>
      {isCurrentPlan && (
        <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
          Текущий план
        </Badge>
      )}
      {isRecommended && !isCurrentPlan && (
        <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground">
          <Star className="h-3 w-3 mr-1" /> Рекомендуем
        </Badge>
      )}
      
      <p className="text-sm text-muted-foreground">{type === 'free' ? 'Бесплатная' : plan.name.split(' ')[0]}</p>
      <p className="text-2xl font-bold text-primary mt-1">
        {plan.price}
        {plan.priceLabel && <span className="text-sm font-normal text-muted-foreground">{plan.priceLabel}</span>}
      </p>
      
      <ul className="mt-4 space-y-2">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      {plan.note && (
        <p className="mt-3 text-xs text-muted-foreground">{plan.note}</p>
      )}
      
      <div className="mt-4">
        {isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled>
            Текущий план
          </Button>
        ) : type === 'corp' ? (
          <Button variant="hero" className="w-full" onClick={onContact}>
            Связаться
          </Button>
        ) : (
          <Button variant="hero" className="w-full" onClick={onSelectPeriod}>
            Выбрать период
          </Button>
        )}
      </div>
    </div>
  );
}
