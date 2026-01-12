import { 
  Settings, 
  BarChart3, 
  Gift, 
  Crown, 
  Trophy,
  Users,
  Loader2,
  User,
  Info,
  TrendingDown,
  PiggyBank,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { subscription } = useSubscription();

  if (authLoading || profileLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthenticated = !!user;
  const isFamilyPlan = subscription?.plan === 'family';
  const monthlySavings = 2450; // Mock data
  const totalSavings = Number(profile?.total_savings) || 12650;

  // Tile data - Family is visible to all authenticated users (with lock indicator for non-family plans)
  const tiles = [
    {
      id: 'settings',
      icon: Settings,
      title: 'Профиль и Настройки',
      subtitle: 'Аккаунт, уведомления',
      to: '/profile/settings',
      gradient: 'from-blue-500 to-cyan-400',
      requiresAuth: true,
      isLocked: false,
    },
    {
      id: 'family',
      icon: Users,
      title: 'Семья',
      subtitle: isFamilyPlan ? 'Члены семьи, списки' : 'Только для тарифа Семья',
      to: isFamilyPlan ? '/family' : '/profile/premium',
      gradient: 'from-pink-500 to-rose-400',
      requiresAuth: true,
      isLocked: !isFamilyPlan,
    },
    {
      id: 'awards',
      icon: Trophy,
      title: 'Награды и достижения',
      subtitle: 'Бонусы, активность',
      to: '/profile/awards',
      gradient: 'from-amber-500 to-yellow-400',
      requiresAuth: true,
      isLocked: false,
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Статистика и Аналитика',
      subtitle: 'Расходы, экономия',
      to: '/profile/analytics',
      gradient: 'from-violet-500 to-purple-400',
      requiresAuth: true,
      isLocked: false,
    },
    {
      id: 'affiliate',
      icon: Gift,
      title: 'Партнёрская программа',
      subtitle: 'Приглашай и зарабатывай',
      to: '/profile/affiliate',
      gradient: 'from-orange-500 to-red-400',
      requiresAuth: false,
      isLocked: false,
    },
    {
      id: 'subscription',
      icon: Crown,
      title: 'Тарифы и подписка',
      subtitle: 'Управление планом',
      to: '/profile/premium',
      gradient: 'from-emerald-500 to-teal-400',
      requiresAuth: false,
      isLocked: false,
    },
  ];

  const visibleTiles = tiles.filter(tile => {
    if (tile.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  // Fill empty spots for non-auth users
  const displayTiles = [...visibleTiles];
  while (displayTiles.length < 6 && displayTiles.length % 2 !== 0) {
    displayTiles.push(null as any);
  }

  return (
    <div className="page-container">
      <div className="px-4 py-4 flex flex-col gap-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
        
        {/* Savings Cards - Only for authenticated users */}
        {isAuthenticated && (
          <div className="grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 text-white shadow-lg">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-16 w-16 rounded-full bg-white/10" />
              <TrendingDown className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-xs opacity-80 font-medium">Экономия за месяц</p>
              <p className="text-2xl font-bold">{monthlySavings.toLocaleString()} ₽</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-lg">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-16 w-16 rounded-full bg-white/10" />
              <PiggyBank className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-xs opacity-80 font-medium">Всего сэкономлено</p>
              <p className="text-2xl font-bold">{totalSavings.toLocaleString()} ₽</p>
            </div>
          </div>
        )}

        {/* Not authenticated message */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Войдите в аккаунт</h2>
                <p className="text-sm text-muted-foreground">Больше возможностей</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/auth/login" className="flex-1">
                <Button variant="hero" size="sm" className="w-full">Войти</Button>
              </Link>
              <Link to="/auth/register" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Регистрация</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Tiles Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {displayTiles.map((tile, index) => {
            if (!tile) {
              return <div key={`empty-${index}`} className="rounded-2xl bg-muted/30" />;
            }
            
            const IconComponent = tile.icon;
            
            return (
              <Link
                key={tile.id}
                to={tile.to}
                className={`
                  relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between
                  bg-gradient-to-br ${tile.gradient} text-white shadow-lg
                  transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  min-h-[120px]
                  ${tile.isLocked ? 'opacity-80' : ''}
                `}
              >
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -left-4 -bottom-8 h-20 w-20 rounded-full bg-white/10" />
                
                <div className="flex items-center justify-between relative z-10">
                  <IconComponent className="h-7 w-7" />
                  {tile.isLocked && (
                    <div className="bg-black/30 rounded-full p-1">
                      <Lock className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="font-bold text-sm leading-tight">{tile.title}</h3>
                  <p className="text-[11px] opacity-80 mt-0.5">{tile.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* About App Link */}
        <Link
          to="/about"
          className="flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="h-4 w-4" />
          <span className="text-sm font-medium">О приложении</span>
        </Link>
      </div>
    </div>
  );
}
