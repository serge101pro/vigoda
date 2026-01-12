import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserHeader } from '@/components/profile/UserHeader';
import { SubscriptionCard } from '@/components/profile/SubscriptionCard';
import { PeriodModal } from '@/components/profile/PeriodModal';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function PremiumPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { subscription, loading, refetch } = useSubscription();
  const [periodModal, setPeriodModal] = useState<'solo' | 'family' | null>(null);
  const [switching, setSwitching] = useState(false);

  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'Пользователь';
  const email = profile?.email || user?.email || '';
  const currentPlan = subscription?.plan || 'free';
  
  // Check if user is the test admin
  const isTestAdmin = email === 'serge101.pro@gmail.com';

  const handleSwitchPlan = async (plan: SubscriptionPlan) => {
    if (!isTestAdmin) return;
    
    setSwitching(true);
    try {
      const { data, error } = await supabase.rpc('set_subscription_plan', { _plan: plan });
      
      if (error) throw error;
      
      if (data) {
        await refetch();
        toast({ title: `Тариф изменён на "${plan}"`, description: 'Функции тарифа активированы' });
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось изменить тариф', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Error switching plan:', err);
      toast({ title: 'Ошибка', variant: 'destructive' });
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-foreground">Тарифы и подписка</h1>
          </div>
        </div>
      </header>

      {/* User Header */}
      <UserHeader
        name={displayName}
        email={email}
        plan={currentPlan}
      />

      <div className="px-4 pb-6 space-y-6">
        {/* Test Admin Controls */}
        {isTestAdmin && (
          <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
            <h3 className="font-bold text-foreground mb-3">🔧 Тестовое переключение тарифов</h3>
            <p className="text-sm text-muted-foreground mb-3">Только для serge101.pro@gmail.com</p>
            <div className="grid grid-cols-4 gap-2">
              {(['free', 'solo', 'family', 'corp'] as SubscriptionPlan[]).map((plan) => (
                <Button
                  key={plan}
                  variant={currentPlan === plan ? 'hero' : 'outline'}
                  size="sm"
                  disabled={switching || currentPlan === plan}
                  onClick={() => handleSwitchPlan(plan)}
                  className="text-xs"
                >
                  {plan === 'free' ? 'Выгода' : plan === 'solo' ? 'Персона' : plan === 'family' ? 'Семья' : 'Бизнес'}
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* Subscription Section */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Подписка</h2>
          <div className="space-y-4">
            <SubscriptionCard type="free" isCurrentPlan={currentPlan === 'free'} />
            <SubscriptionCard type="solo" isCurrentPlan={currentPlan === 'solo'} onSelectPeriod={() => setPeriodModal('solo')} />
            <SubscriptionCard type="family" isCurrentPlan={currentPlan === 'family'} isRecommended onSelectPeriod={() => setPeriodModal('family')} />
            <SubscriptionCard type="corp" isCurrentPlan={currentPlan === 'corp'} onContact={() => window.open('mailto:corp@vigodnotut.ru')} />
          </div>
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
