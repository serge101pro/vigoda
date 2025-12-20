import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Ожидает оплаты', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
  paid: { label: 'Оплачен', color: 'bg-blue-500/10 text-blue-600', icon: CreditCard },
  processing: { label: 'Готовится', color: 'bg-purple-500/10 text-purple-600', icon: Package },
  shipping: { label: 'В доставке', color: 'bg-cyan-500/10 text-cyan-600', icon: Truck },
  delivered: { label: 'Доставлен', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  cancelled: { label: 'Отменён', color: 'bg-red-500/10 text-red-600', icon: XCircle },
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = orders?.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'paid', 'processing', 'shipping'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  }) || [];

  if (!user) {
    return (
      <div className="page-container">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-lg">История заказов</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Войдите в аккаунт</h2>
          <p className="text-muted-foreground text-center mb-4">
            Чтобы увидеть историю заказов, необходимо авторизоваться
          </p>
          <Link to="/auth/login">
            <Button variant="hero">Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">История заказов</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="completed">Завершённые</TabsTrigger>
            <TabsTrigger value="cancelled">Отменённые</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders List */}
      <div className="px-4 pb-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Загрузка заказов...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Нет заказов</h2>
            <p className="text-muted-foreground text-center mb-4">
              {activeTab === 'all' 
                ? 'Вы ещё не сделали ни одного заказа' 
                : 'Нет заказов в этой категории'}
            </p>
            <Link to="/catalog">
              <Button variant="hero">Перейти в каталог</Button>
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            
            return (
              <div 
                key={order.id}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </span>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Заказ #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="font-bold text-lg text-primary">
                      {order.total_amount.toLocaleString()} ₽
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                      {order.order_items.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex-shrink-0 w-16">
                          <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden">
                            {item.product_image ? (
                              <img 
                                src={item.product_image} 
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-center mt-1 text-muted-foreground">
                            {item.quantity} шт
                          </p>
                        </div>
                      ))}
                      {order.order_items.length > 4 && (
                        <div className="flex-shrink-0 w-16">
                          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                            <span className="text-sm font-bold text-muted-foreground">
                              +{order.order_items.length - 4}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {order.order_items.length} {order.order_items.length === 1 ? 'товар' : 
                        order.order_items.length < 5 ? 'товара' : 'товаров'}
                    </p>
                  </div>
                )}

                {/* Delivery Info */}
                {order.delivery_address && (
                  <div className="px-4 pb-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4 mt-0.5" />
                      <span>{order.delivery_address}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  {order.status === 'pending' && (
                    <Link to="/payment" className="flex-1">
                      <Button variant="hero" className="w-full">
                        Оплатить
                      </Button>
                    </Link>
                  )}
                  {order.status === 'delivered' && (
                    <Button variant="outline" className="flex-1">
                      Повторить заказ
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
