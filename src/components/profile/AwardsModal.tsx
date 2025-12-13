import { X, Check, Lock, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface Award {
  id: string;
  icon: string;
  name: string;
  description: string;
  reward: string;
  status: 'earned' | 'in_progress' | 'locked';
  earnedDate?: string;
  progress?: number;
  total?: number;
}

interface AwardsModalProps {
  open: boolean;
  onClose: () => void;
  awards: Award[];
}

const mockAwards: Award[] = [
  // Earned
  { id: '1', icon: '🏅', name: 'Новичок', description: 'Добавил первый рецепт', reward: '50₽ кешбэка', status: 'earned', earnedDate: '20 октября 2025' },
  { id: '2', icon: '⭐', name: 'Кулинар', description: 'Получил 10+ лайков', reward: '100₽ кешбэка', status: 'earned', earnedDate: '23 октября 2025' },
  // In progress
  { id: '3', icon: '⭐⭐', name: 'Шеф-повар', description: 'Получи 50+ лайков на рецепте', reward: '300₽ скидка', status: 'in_progress', progress: 15, total: 50 },
  { id: '4', icon: '📦', name: 'Коллекционер', description: 'Добавь 5+ рецептов', reward: 'Месяц Premium бесплатно', status: 'in_progress', progress: 1, total: 5 },
  // Locked
  { id: '5', icon: '⭐⭐⭐', name: 'Мастер', description: 'Получи 100+ лайков', reward: '1,000 бонусов', status: 'locked' },
  { id: '6', icon: '🍲', name: 'Гурман', description: '500+ лайков на одном рецепте', reward: '500₽/месяц постоянно', status: 'locked' },
  { id: '7', icon: '👥', name: 'Популярный', description: 'Набери 100+ подписчиков', reward: '5% от всех заказов семьи', status: 'locked' },
  { id: '8', icon: '🔥', name: 'Вирусный', description: '1000+ просмотров за неделю', reward: 'Приоритет в продвижении', status: 'locked' },
];

export function AwardsModal({ open, onClose, awards = mockAwards }: AwardsModalProps) {
  const earned = awards.filter(a => a.status === 'earned');
  const inProgress = awards.filter(a => a.status === 'in_progress');
  const locked = awards.filter(a => a.status === 'locked');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="bg-accent text-accent-foreground -m-6 mb-4 p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              🏆 Награды
            </DialogTitle>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Earned */}
        <section className="mb-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Check className="h-4 w-4 text-primary" />
            Получено ({earned.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {earned.map(award => (
              <div key={award.id} className="bg-card border border-border rounded-xl p-3">
                <div className="text-3xl mb-2">{award.icon}</div>
                <h4 className="font-bold text-sm">{award.name}</h4>
                <p className="text-xs text-muted-foreground">{award.description}</p>
                <p className="text-xs text-accent font-semibold mt-1">🎁 {award.reward}</p>
                <p className="text-xs text-primary mt-1">✓ Получено</p>
                <p className="text-[10px] text-muted-foreground">{award.earnedDate}</p>
              </div>
            ))}
          </div>
        </section>

        {/* In Progress */}
        <section className="mb-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <TrendingUp className="h-4 w-4 text-accent" />
            В прогрессе ({inProgress.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {inProgress.map(award => (
              <div key={award.id} className="bg-card border border-border rounded-xl p-3">
                <div className="text-3xl mb-2 opacity-70">{award.icon}</div>
                <h4 className="font-bold text-sm">{award.name}</h4>
                <p className="text-xs text-muted-foreground">{award.description}</p>
                <p className="text-xs text-accent font-semibold mt-1">🎁 {award.reward}</p>
                <Progress value={(award.progress! / award.total!) * 100} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {award.progress}/{award.total} · Осталось: {award.total! - award.progress!}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Locked */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Заблокировано ({locked.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(award => (
              <div key={award.id} className="bg-muted border border-border rounded-xl p-3 opacity-60">
                <div className="text-3xl mb-2 grayscale">{award.icon}</div>
                <h4 className="font-bold text-sm">{award.name}</h4>
                <p className="text-xs text-muted-foreground">{award.description}</p>
                <p className="text-xs text-accent font-semibold mt-1">🎁 {award.reward}</p>
              </div>
            ))}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
