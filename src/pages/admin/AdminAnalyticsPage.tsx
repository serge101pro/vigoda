import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  BarChart3, Loader2, TrendingUp, TrendingDown,
  Users, ShoppingCart, CreditCard, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/common/BackButton';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminAnalyticsPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersThisMonth: 0,
    newUsersThisMonth: 0,
    conversionRate: 0,
  });
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isSuperadmin) return;

      try {
        // Get orders for revenue
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, created_at');
        
        const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const ordersThisMonth = orders?.filter(o => new Date(o.created_at) >= thisMonth).length || 0;

        // Get new users this month
        const { count: newUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonth.toISOString());

        // Get subscription distribution
        const { data: subs } = await supabase
          .from('user_subscriptions')
          .select('plan');
        
        const planCounts: Record<string, number> = {};
        subs?.forEach(s => {
          planCounts[s.plan] = (planCounts[s.plan] || 0) + 1;
        });

        const planLabels: Record<string, string> = {
          free: 'Бесплатный',
          solo: 'Персональный',
          family: 'Семейный',
          corp: 'Бизнес',
        };

        setPlanDistribution(
          Object.entries(planCounts).map(([plan, count]) => ({
            name: planLabels[plan] || plan,
            value: count,
          }))
        );

        setStats({
          totalRevenue,
          ordersThisMonth,
          newUsersThisMonth: newUsers || 0,
          conversionRate: 12.5,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSuperadmin) {
      fetchAnalytics();
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <BackButton fallbackPath="/admin" />
            <div>
              <h1 className="text-xl font-bold">Аналитика</h1>
              <p className="text-sm text-muted-foreground">Статистика платформы</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Выручка</p>
                      <p className="text-xl font-bold">{stats.totalRevenue.toLocaleString()} ₽</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12% за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Заказы (месяц)</p>
                      <p className="text-xl font-bold">{stats.ordersThisMonth}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8% за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Новые (месяц)</p>
                      <p className="text-xl font-bold">{stats.newUsersThisMonth}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+15% за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Конверсия</p>
                      <p className="text-xl font-bold">{stats.conversionRate}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                    <TrendingDown className="h-3 w-3" />
                    <span>-2% за месяц</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Распределение тарифов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {planDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
