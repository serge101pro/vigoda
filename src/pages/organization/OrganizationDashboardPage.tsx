import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Wallet, 
  ShoppingCart, 
  FileText, 
  BarChart3,
  Clock,
  Plus,
  Download,
  Settings,
  ChevronRight,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Utensils,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';

export default function OrganizationDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    organization, 
    membership, 
    members, 
    balance,
    coopCart,
    coopCartItems,
    loading,
    isAdmin,
    isManager,
    getCoopCartTotal,
    getTimeUntilDeadline,
    getRemainingLimit
  } = useOrganization();

  const timeUntilDeadline = getTimeUntilDeadline();
  const cartTotal = getCoopCartTotal();
  const remainingLimit = getRemainingLimit();

  // Mock data for demo
  const mockBalance = balance?.balance || 125000;
  const mockSpentThisMonth = 47500;
  const daysRemaining = 12;
  const projectedDays = Math.floor(mockBalance / (mockSpentThisMonth / 30));

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Demo mode if no real organization
  const orgName = organization?.name || 'ООО "Демо Компания"';
  const memberCount = members.length || 15;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Кабинет организации</h1>
            <p className="text-xs text-muted-foreground">{orgName}</p>
          </div>
          {isAdmin && (
            <Link to="/organization/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Balance Card */}
        <section className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80">Баланс компании</p>
              <h2 className="text-3xl font-bold">{mockBalance.toLocaleString()} ₽</h2>
            </div>
            <div className="p-2 bg-white/20 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm opacity-90 mb-4">
            <TrendingUp className="h-4 w-4" />
            <span>При текущем темпе хватит на ~{projectedDays} дней</span>
          </div>

          <div className="flex gap-2">
            <Link to="/organization/top-up" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Пополнить
              </Button>
            </Link>
            <Link to="/organization/invoices" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-1" />
                Выставить счёт
              </Button>
            </Link>
          </div>
        </section>

        {/* Co-op Cart Status */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Совместная корзина</h3>
            </div>
            {timeUntilDeadline && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeUntilDeadline.hours}ч {timeUntilDeadline.minutes}м до заказа
              </Badge>
            )}
          </div>

          <div className="bg-muted/50 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Товаров в корзине</span>
              <span className="font-semibold">{coopCartItems.length || 8}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Сумма заказа</span>
              <span className="font-bold text-primary">{(cartTotal || 4250).toLocaleString()} ₽</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/organization/coop-cart" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Смотреть корзину
              </Button>
            </Link>
            {(isAdmin || isManager) && (
              <Button variant="hero" size="sm">
                Оформить сейчас
              </Button>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Сотрудников</span>
            </div>
            <p className="text-2xl font-bold">{memberCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Расходы/мес</span>
            </div>
            <p className="text-2xl font-bold">{mockSpentThisMonth.toLocaleString()} ₽</p>
          </div>
        </section>

        {/* My Limit (for employees) */}
        {!isAdmin && (
          <section className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Мой лимит</h3>
              <Badge variant={remainingLimit > 5000 ? 'secondary' : 'destructive'}>
                Осталось: {(remainingLimit || 12500).toLocaleString()} ₽
              </Badge>
            </div>
            <Progress value={((membership?.monthly_limit || 15000) - (remainingLimit || 12500)) / (membership?.monthly_limit || 15000) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Потрачено {(2500).toLocaleString()} ₽ из {(membership?.monthly_limit || 15000).toLocaleString()} ₽
            </p>
          </section>
        )}

        {/* Quick Access */}
        <section>
          <h3 className="font-semibold mb-3">Быстрый доступ</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/catering">
              <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
                <Utensils className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium">Кейтеринг</p>
                <p className="text-xs text-muted-foreground">Корпоративные мероприятия</p>
              </div>
            </Link>
            <Link to="/ready-meals">
              <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
                <Coffee className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium">Бизнес-ланчи</p>
                <p className="text-xs text-muted-foreground">Готовые обеды в офис</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Menu Items */}
        <section className="space-y-2">
          <Link to="/organization/employees">
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Сотрудники</p>
                  <p className="text-xs text-muted-foreground">Управление доступом и лимитами</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>

          <Link to="/organization/analytics">
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Аналитика расходов</p>
                  <p className="text-xs text-muted-foreground">Статистика по сотрудникам и категориям</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>

          <Link to="/organization/documents">
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Документы</p>
                  <p className="text-xs text-muted-foreground">Счета, УПД, акты</p>
                </div>
              </div>
              <Badge variant="secondary">3 новых</Badge>
            </div>
          </Link>

          <Link to="/organization/approvals">
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">Согласование</p>
                  <p className="text-xs text-muted-foreground">Заявки на одобрение</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">2 новых</Badge>
            </div>
          </Link>

          <Link to="/organization/orders">
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">История заказов</p>
                  <p className="text-xs text-muted-foreground">Все заказы организации</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        </section>

        {/* Cashback Info */}
        <section className="bg-accent/10 rounded-2xl border border-accent/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-xl">
              <CreditCard className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Кэшбэк на баланс</p>
              <p className="text-sm text-muted-foreground">2% с каждого заказа возвращается на баланс компании</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
