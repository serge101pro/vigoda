import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, Package, 
  MoreVertical, Loader2, Calendar, MapPin, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { BackButton } from '@/components/common/BackButton';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  payment_method: string | null;
  created_at: string;
  items_count?: number;
}

export default function AdminOrdersPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isSuperadmin) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        // Get items count for each order
        const ordersWithCounts = await Promise.all(
          (data || []).map(async (order) => {
            const { count } = await supabase
              .from('order_items')
              .select('*', { count: 'exact', head: true })
              .eq('order_id', order.id);
            
            return {
              ...order,
              items_count: count || 0,
            };
          })
        );

        setOrders(ordersWithCounts);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Ошибка загрузки заказов');
      } finally {
        setLoading(false);
      }
    };

    if (isSuperadmin) {
      fetchOrders();
    }
  }, [isSuperadmin]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600">Ожидает</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-600">В обработке</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500/10 text-purple-600">Отправлен</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500/10 text-green-600">Доставлен</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-600">Отменён</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.delivery_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-xl font-bold">Заказы</h1>
              <p className="text-sm text-muted-foreground">{orders.length} заказов</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ID или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm">#{order.id.slice(0, 8)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                        </div>
                        {order.delivery_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{order.delivery_address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3" />
                          {order.items_count} товаров
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-lg">{order.total_amount?.toLocaleString()} ₽</span>
                        {order.payment_method && (
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {order.payment_method}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Просмотр деталей</DropdownMenuItem>
                        <DropdownMenuItem>Изменить статус</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Отменить заказ</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
