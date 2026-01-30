import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Shield, Users, ShoppingCart, Settings, BarChart3, 
  FileText, Bell, Database, CreditCard, Mail, 
  AlertTriangle, Loader2, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/common/BackButton';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRecipes: number;
  premiumUsers: number;
  pendingApprovals: number;
}

const adminModules = [
  {
    id: 'users',
    title: 'Пользователи',
    description: 'Управление пользователями и ролями',
    icon: Users,
    href: '/admin/users',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'orders',
    title: 'Заказы',
    description: 'Просмотр и управление заказами',
    icon: ShoppingCart,
    href: '/admin/orders',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    description: 'Статистика и отчёты',
    icon: BarChart3,
    href: '/admin/analytics',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    id: 'subscriptions',
    title: 'Подписки',
    description: 'Управление тарифами и подписками',
    icon: CreditCard,
    href: '/admin/subscriptions',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    id: 'content',
    title: 'Контент',
    description: 'Продукты, рецепты, планы питания',
    icon: FileText,
    href: '/admin/content',
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    description: 'Массовые рассылки и push-уведомления',
    icon: Bell,
    href: '/admin/notifications',
    color: 'bg-yellow-500/10 text-yellow-600',
  },
  {
    id: 'database',
    title: 'База данных',
    description: 'Просмотр и редактирование данных',
    icon: Database,
    href: '/admin/database',
    color: 'bg-slate-500/10 text-slate-600',
  },
  {
    id: 'settings',
    title: 'Настройки',
    description: 'Системные параметры',
    icon: Settings,
    href: '/admin/settings',
    color: 'bg-gray-500/10 text-gray-600',
  },
];

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSuperadmin) return;

      try {
        // Fetch various stats in parallel
        const [
          { count: usersCount },
          { count: ordersCount },
          { count: productsCount },
          { count: recipesCount },
          { count: premiumCount },
          { count: approvalsCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('recipes').select('*', { count: 'exact', head: true }),
          supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).neq('plan', 'free'),
          supabase.from('order_approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
          totalUsers: usersCount || 0,
          totalOrders: ordersCount || 0,
          totalProducts: productsCount || 0,
          totalRecipes: recipesCount || 0,
          premiumUsers: premiumCount || 0,
          pendingApprovals: approvalsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSuperadmin) {
      fetchStats();
    }
  }, [isSuperadmin]);

  // Show loading while auth or superadmin check is in progress
  if (authLoading || superadminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only redirect after loading is complete and we know the user is not superadmin
  if (!user || !isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackButton fallbackPath="/" variant="ghost" size="icon-sm" className="text-white hover:bg-white/20" />
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  <h1 className="text-xl font-bold">Панель Администратора</h1>
                </div>
                <p className="text-white/70 text-sm">{user?.email}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              <Crown className="h-3 w-3 mr-1" />
              СуперАдмин
            </Badge>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
        {/* Stats Cards */}
        <section className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stats?.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Пользователей</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stats?.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Заказов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stats?.premiumUsers}</p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stats?.pendingApprovals}</p>
                  <p className="text-xs text-muted-foreground">Ожидают</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Admin Modules */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Модули управления</h2>
          <div className="grid grid-cols-1 gap-3">
            {adminModules.map((module) => (
              <Link key={module.id} to={module.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center`}>
                        <module.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{module.title}</h3>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Быстрые действия</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm">Рассылка</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Bell className="h-5 w-5" />
              <span className="text-sm">Push</span>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
