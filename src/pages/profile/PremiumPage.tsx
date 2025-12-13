import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserHeader } from '@/components/profile/UserHeader';
import { SubscriptionCard } from '@/components/profile/SubscriptionCard';
import { PeriodModal } from '@/components/profile/PeriodModal';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Trophy, 
  Activity, 
  MapPin, 
  CreditCard, 
  Wallet, 
  Bell, 
  Settings 
} from 'lucide-react';

export default function PremiumPage() {
  const { user } = useAppStore();
  const [periodModal, setPeriodModal] = useState<'solo' | 'family' | null>(null);

  const menuItems = [
    { icon: Trophy, label: 'Награды', to: '/profile/awards' },
    { icon: Activity, label: 'Активность', to: '/profile/activity' },
    { icon: MapPin, label: 'Мои адреса', to: '/profile/addresses' },
    { icon: CreditCard, label: 'Карты лояльности', to: '/profile/loyalty-cards' },
    { icon: Wallet, label: 'Способы оплаты', to: '/profile/payment-methods' },
    { icon: Bell, label: 'Уведомления', to: '/profile/notifications' },
    { icon: Settings, label: 'Настройки', to: '/profile/settings' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Подписка</h1>
          </div>
        </div>
      </header>

      {/* User Header */}
      <UserHeader
        name={user?.name || 'Пользователь'}
        email={user?.email || 'user@example.com'}
        plan="free"
      />

      <div className="px-4 pb-6 space-y-6">
        {/* Subscription Section */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Подписка</h2>
          <div className="space-y-4">
            <SubscriptionCard type="free" isCurrentPlan />
            <SubscriptionCard type="solo" onSelectPeriod={() => setPeriodModal('solo')} />
            <SubscriptionCard type="family" isRecommended onSelectPeriod={() => setPeriodModal('family')} />
            <SubscriptionCard type="corp" onContact={() => window.open('mailto:corp@vigodnotut.ru')} />
          </div>
        </section>

        {/* Menu */}
        <section className="space-y-2">
          {menuItems.map(item => (
            <ProfileMenuItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
            />
          ))}
        </section>

        {/* Stats */}
        <section>
          <ProfileStats
            savings={3120}
            listsCreated={23}
            recipesPublished={1}
            awardsEarned={2}
          />
        </section>
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
