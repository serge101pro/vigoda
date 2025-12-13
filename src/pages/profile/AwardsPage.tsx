import { ArrowLeft, Check, TrendingUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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

const awards: Award[] = [
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

export default function AwardsPage() {
  const earned = awards.filter(a => a.status === 'earned');
  const inProgress = awards.filter(a => a.status === 'in_progress');
  const locked = awards.filter(a => a.status === 'locked');

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-accent text-accent-foreground">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              🏆 Награды
            </h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-8">
        {/* Earned */}
        <section>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
            <Check className="h-5 w-5 text-primary" />
            Получено ({earned.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {earned.map(award => (
              <div key={award.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="text-4xl mb-3">{award.icon}</div>
                <h4 className="font-bold">{award.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{award.description}</p>
                <p className="text-sm text-accent font-semibold mt-2">🎁 {award.reward}</p>
                <p className="text-sm text-primary font-medium mt-1">✓ Получено</p>
                <p className="text-xs text-muted-foreground">{award.earnedDate}</p>
              </div>
            ))}
          </div>
        </section>

        {/* In Progress */}
        <section>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
            <TrendingUp className="h-5 w-5 text-accent" />
            В прогрессе ({inProgress.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {inProgress.map(award => (
              <div key={award.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="text-4xl mb-3 opacity-70">{award.icon}</div>
                <h4 className="font-bold">{award.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{award.description}</p>
                <p className="text-sm text-accent font-semibold mt-2">🎁 {award.reward}</p>
                <Progress value={(award.progress! / award.total!) * 100} className="h-2 mt-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {award.progress}/{award.total} · Осталось: {award.total! - award.progress!}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Locked */}
        <section>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Заблокировано ({locked.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(award => (
              <div key={award.id} className="bg-muted border border-border rounded-2xl p-4 opacity-60">
                <div className="text-4xl mb-3 grayscale">{award.icon}</div>
                <h4 className="font-bold">{award.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{award.description}</p>
                <p className="text-sm text-accent font-semibold mt-2">🎁 {award.reward}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
