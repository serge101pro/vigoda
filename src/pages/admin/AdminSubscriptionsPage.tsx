import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Crown, Users, Loader2, 
  TrendingUp, Calendar, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStats {
  free: number;
  solo: number;
  family: number;
  corp: number;
  total: number;
}

export default function AdminSubscriptionsPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSuperadmin) return;
      
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('plan');
          
        if (error) throw error;
        
        const counts = {
          free: 0,
          solo: 0,
          family: 0,
          corp: 0,
          total: data?.length || 0
        };
        
        data?.forEach(sub => {
          if (sub.plan in counts) {
            counts[sub.plan as keyof typeof counts]++;
          }
        });
        
        setStats(counts);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [isSuperadmin]);

  if (superadminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  const plans = [
    { key: 'free', name: 'Выгода', color: 'bg-gray-500/10 text-gray-600', price: 'Бесплатно' },
    { key: 'solo', name: 'Персона', color: 'bg-green-500/10 text-green-600', price: '199₽/мес' },
    { key: 'family', name: 'Семья', color: 'bg-purple-500/10 text-purple-600', price: '59₽/чел/мес' },
    { key: 'corp', name: 'Бизнес', color: 'bg-orange-500/10 text-orange-600', price: 'Договорная' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Подписки</h1>
              <p className="text-sm text-muted-foreground">Управление тарифами</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          {plans.map(plan => (
            <Card key={plan.key} className={plan.color.replace('text-', 'border-').replace('/10', '/20')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {loading ? '...' : stats?.[plan.key as keyof SubscriptionStats] || 0}
                    </p>
                    <p className="text-sm font-medium">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.price}</p>
                  </div>
                  <Badge className={plan.color}>{plan.name}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Действия</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Crown className="h-4 w-4 mr-2" />
                Создать промо-код
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Отчёт по подпискам
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Истекающие подписки
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Pricing Management */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Управление тарифами</h2>
          {plans.filter(p => p.key !== 'free').map(plan => (
            <Card key={plan.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={plan.color}>{plan.name}</Badge>
                    <span className="text-muted-foreground">{plan.price}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Изменить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
