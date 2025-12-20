import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Calendar,
  Filter,
  Search,
  User,
  Building2,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  items: OrderItem[];
  total: number;
  status: 'delivered' | 'in_progress' | 'cancelled';
  date: string;
  category: string;
}

// Demo data
const demoOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-1234',
    employeeName: 'Александр Иванов',
    employeeAvatar: '👨‍💼',
    department: 'Руководство',
    items: [
      { id: '1', name: 'Бизнес-ланч "Премиум"', quantity: 1, price: 650 },
      { id: '2', name: 'Кофе латте', quantity: 2, price: 180 },
    ],
    total: 1010,
    status: 'delivered',
    date: '2024-12-19',
    category: 'lunch',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-1233',
    employeeName: 'Мария Петрова',
    employeeAvatar: '👩‍💼',
    department: 'HR',
    items: [
      { id: '1', name: 'Салат Цезарь', quantity: 1, price: 420 },
      { id: '2', name: 'Суп дня', quantity: 1, price: 280 },
    ],
    total: 700,
    status: 'delivered',
    date: '2024-12-19',
    category: 'lunch',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-1232',
    employeeName: 'Дмитрий Сидоров',
    employeeAvatar: '👨‍💻',
    department: 'Разработка',
    items: [
      { id: '1', name: 'Пицца Маргарита', quantity: 2, price: 890 },
      { id: '2', name: 'Напитки ассорти', quantity: 4, price: 320 },
    ],
    total: 2100,
    status: 'in_progress',
    date: '2024-12-19',
    category: 'office_kitchen',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-1231',
    employeeName: 'Елена Козлова',
    employeeAvatar: '👩‍🎨',
    department: 'Маркетинг',
    items: [
      { id: '1', name: 'Фуршет на 20 персон', quantity: 1, price: 25000 },
    ],
    total: 25000,
    status: 'delivered',
    date: '2024-12-18',
    category: 'corporate_event',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-1230',
    employeeName: 'Николай Федоров',
    employeeAvatar: '👨‍💼',
    department: 'Продажи',
    items: [
      { id: '1', name: 'Обед комплексный', quantity: 1, price: 450 },
    ],
    total: 450,
    status: 'cancelled',
    date: '2024-12-17',
    category: 'lunch',
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-1229',
    employeeName: 'Анна Новикова',
    employeeAvatar: '👩‍💼',
    department: 'Бухгалтерия',
    items: [
      { id: '1', name: 'Кофе для офиса (1кг)', quantity: 3, price: 1200 },
      { id: '2', name: 'Печенье ассорти', quantity: 2, price: 350 },
    ],
    total: 4300,
    status: 'delivered',
    date: '2024-12-16',
    category: 'office_kitchen',
  },
];

const statusConfig = {
  delivered: { label: 'Доставлен', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  in_progress: { label: 'В пути', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  cancelled: { label: 'Отменён', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
};

const categoryLabels: Record<string, string> = {
  lunch: 'Обед',
  office_kitchen: 'Офисная кухня',
  corporate_event: 'Корпоратив',
  other: 'Прочее',
};

const departments = ['Все отделы', 'Руководство', 'HR', 'Разработка', 'Маркетинг', 'Продажи', 'Бухгалтерия'];
const periods = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'custom', label: 'Произвольный' },
];

export default function OrganizationOrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Все отделы');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const filteredOrders = demoOrders.filter(order => {
    const matchesSearch = order.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'Все отделы' || order.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const deliveredCount = filteredOrders.filter(o => o.status === 'delivered').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

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
            <h1 className="text-lg font-bold text-foreground">История заказов</h1>
            <p className="text-xs text-muted-foreground">{filteredOrders.length} заказов</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Сумма заказов</p>
            <p className="text-xl font-bold">{totalAmount.toLocaleString()} ₽</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Доставлено</p>
            <p className="text-xl font-bold text-green-500">{deliveredCount} из {filteredOrders.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по сотруднику или номеру..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="flex-1">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="flex-1">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const isExpanded = expandedOrders.includes(order.id);

            return (
              <Collapsible key={order.id} open={isExpanded} onOpenChange={() => toggleOrderExpand(order.id)}>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                          {order.employeeAvatar}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate">{order.employeeName}</p>
                            <Badge className={`${status.color} border`}>{status.label}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{order.orderNumber}</span>
                            <span>•</span>
                            <span>{formatDate(order.date)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{order.department}</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {categoryLabels[order.category]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{order.total.toLocaleString()} ₽</span>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 border-t border-border">
                      <p className="text-sm font-medium mb-2 pt-3">Состав заказа:</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{item.name}</span>
                              <span className="text-muted-foreground">×{item.quantity}</span>
                            </div>
                            <span>{item.price.toLocaleString()} ₽</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                        <span className="font-medium">Итого:</span>
                        <span className="font-bold">{order.total.toLocaleString()} ₽</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Заказы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
