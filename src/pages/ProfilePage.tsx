import { 
  ArrowLeft, 
  User, 
  Settings, 
  Heart, 
  ClipboardList, 
  BarChart3, 
  Gift, 
  Crown, 
  ChevronRight,
  Share2,
  Copy,
  Users,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/useAppStore';

const menuItems = [
  { icon: ClipboardList, label: 'Мои списки', to: '/profile/lists', badge: '3' },
  { icon: Heart, label: 'Избранное', to: '/profile/favorites' },
  { icon: BarChart3, label: 'Аналитика расходов', to: '/profile/analytics' },
  { icon: Gift, label: 'Партнёрская программа', to: '/profile/affiliate', highlight: true },
  { icon: Crown, label: 'Premium подписка', to: '/profile/premium', accent: true },
  { icon: Settings, label: 'Настройки', to: '/profile/settings' },
];

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAppStore();

  if (!isAuthenticated) {
    return (
      <div className="page-container flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-6">
          <User className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Войдите в аккаунт</h1>
        <p className="text-muted-foreground text-center mb-6">
          Сохраняйте списки, отслеживайте экономию и получайте персональные рекомендации
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <Link to="/auth/login" className="flex-1">
            <Button variant="hero" size="lg" className="w-full">
              Войти
            </Button>
          </Link>
          <Link to="/auth/register" className="flex-1">
            <Button variant="hero-outline" size="lg" className="w-full">
              Регистрация
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Профиль</h1>
          </div>
        </div>
      </header>

      {/* User Info */}
      <section className="px-4 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              {user?.name?.charAt(0) || 'П'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {user?.name || 'Пользователь'}
            </h2>
            <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-primary-light rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">2 450 ₽</p>
            <p className="text-xs text-muted-foreground">Экономия</p>
          </div>
          <div className="bg-accent-light rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-accent">12</p>
            <p className="text-xs text-muted-foreground">Покупок</p>
          </div>
          <div className="bg-muted rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">150</p>
            <p className="text-xs text-muted-foreground">Бонусов</p>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="px-4 pb-6">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                item.accent
                  ? 'bg-accent text-accent-foreground'
                  : item.highlight
                  ? 'bg-primary-light'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.accent ? '' : 'text-primary'}`} />
                <span className="font-semibold">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        <Button
          variant="ghost"
          size="lg"
          className="w-full mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          Выйти из аккаунта
        </Button>
      </section>
    </div>
  );
}
