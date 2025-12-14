import { useState } from 'react';
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
  Trophy,
  Activity,
  MapPin,
  CreditCard,
  Wallet,
  Bell,
  ChefHat
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { UserHeader } from '@/components/profile/UserHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { SubscriptionCard } from '@/components/profile/SubscriptionCard';
import { PeriodModal } from '@/components/profile/PeriodModal';
import { ActivityModal } from '@/components/profile/ActivityModal';

const menuItems = [
  { icon: Trophy, label: 'Награды', to: '/profile/awards', badge: '2' },
  { icon: Activity, label: 'Активность', to: '', isModal: true },
  { icon: MapPin, label: 'Мои адреса', to: '/profile/addresses' },
  { icon: CreditCard, label: 'Карты лояльности', to: '/profile/loyalty-cards' },
  { icon: Wallet, label: 'Способы оплаты', to: '/profile/payment-methods' },
  { icon: Bell, label: 'Уведомления', to: '/profile/notifications' },
  { icon: Settings, label: 'Настройки', to: '/profile/settings' },
];

const quickLinks = [
  { icon: ClipboardList, label: 'Мои списки', to: '/profile/lists', badge: '3' },
  { icon: Heart, label: 'Избранное', to: '/favorites' },
  { icon: ChefHat, label: 'Мои рецепты', to: '/profile/recipes' },
  { icon: BarChart3, label: 'Аналитика расходов', to: '/profile/analytics' },
  { icon: Gift, label: 'Партнёрская программа', to: '/profile/affiliate', highlight: true },
];

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAppStore();
  const [periodModal, setPeriodModal] = useState<'solo' | 'family' | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

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
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Профиль</h1>
          </div>
        </div>
      </header>

      {/* User Header */}
      <UserHeader
        name={user?.name || 'Пользователь'}
        email={user?.email || 'user@example.com'}
        plan="free"
        onEditProfile={() => {}}
      />

      <div className="px-4 pb-6 space-y-6">
        {/* Subscription Preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Подписка</h2>
            <Link to="/profile/premium" className="text-sm font-semibold text-primary">
              Все планы
            </Link>
          </div>
          <SubscriptionCard type="free" isCurrentPlan />
          
          <div className="mt-3">
            <SubscriptionCard 
              type="solo" 
              onSelectPeriod={() => setPeriodModal('solo')}
            />
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Быстрый доступ</h2>
          <div className="space-y-2">
            {quickLinks.map(item => (
              <ProfileMenuItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                badge={item.badge}
                iconClassName={item.highlight ? 'text-accent' : 'text-primary'}
              />
            ))}
          </div>
        </section>

        {/* Premium CTA */}
        <section>
          <Link to="/profile/premium">
            <div className="bg-gradient-to-r from-accent to-accent/80 rounded-2xl p-4 text-accent-foreground">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8" />
                <div>
                  <h3 className="font-bold text-lg">Premium подписка</h3>
                  <p className="text-sm opacity-90">Больше возможностей для экономии</p>
                </div>
                <ChevronRight className="h-6 w-6 ml-auto" />
              </div>
            </div>
          </Link>
        </section>

        {/* Menu */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Настройки и данные</h2>
          <div className="space-y-2">
            {menuItems.map(item => (
              <ProfileMenuItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                badge={item.badge}
              />
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Статистика</h2>
          <ProfileStats
            savings={3120}
            listsCreated={23}
            recipesPublished={1}
            awardsEarned={2}
          />
        </section>

        {/* Logout */}
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          Выйти из аккаунта
        </Button>
      </div>

      {/* Period Modal */}
      {periodModal && (
        <PeriodModal
          open={!!periodModal}
          onClose={() => setPeriodModal(null)}
          planType={periodModal}
          onSelect={(period) => {
            console.log('Selected period:', period);
            setPeriodModal(null);
          }}
        />
      )}
    </div>
  );
}
