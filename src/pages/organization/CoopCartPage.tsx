import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Clock, Users, Trash2, Plus, Minus, AlertCircle, Check, Coffee, Utensils, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganization, SpendingCategory } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

interface CartItemDisplay {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  addedBy: string;
  addedByAvatar: string;
  category: SpendingCategory;
}

// Mock data for demo
const mockCartItems: CartItemDisplay[] = [
  { id: '1', name: 'Салат Цезарь', image: '🥗', quantity: 5, price: 450, addedBy: 'Иванов А.', addedByAvatar: '👨', category: 'lunch' },
  { id: '2', name: 'Суп куриный', image: '🍲', quantity: 3, price: 320, addedBy: 'Петрова М.', addedByAvatar: '👩', category: 'lunch' },
  { id: '3', name: 'Кофе зерновой 1кг', image: '☕', quantity: 2, price: 1200, addedBy: 'Сидоров К.', addedByAvatar: '👨', category: 'office_kitchen' },
  { id: '4', name: 'Круассаны, 6 шт', image: '🥐', quantity: 2, price: 380, addedBy: 'Козлова Е.', addedByAvatar: '👩', category: 'office_kitchen' },
  { id: '5', name: 'Пицца Маргарита', image: '🍕', quantity: 2, price: 890, addedBy: 'Новиков Д.', addedByAvatar: '👨', category: 'lunch' },
];

const categoryLabels: Record<SpendingCategory, { label: string; icon: typeof Coffee }> = {
  lunch: { label: 'Обед', icon: Utensils },
  corporate_event: { label: 'Корпоратив', icon: Gift },
  office_kitchen: { label: 'Офис', icon: Coffee },
  other: { label: 'Прочее', icon: ShoppingCart },
};

export default function CoopCartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    coopCart, 
    isAdmin, 
    isManager, 
    getTimeUntilDeadline 
  } = useOrganization();
  
  const [items, setItems] = useState(mockCartItems);
  
  const timeUntilDeadline = getTimeUntilDeadline() || { hours: 2, minutes: 15 };
  const isDeadlineSoon = timeUntilDeadline.hours < 1;

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast({ title: 'Товар удалён из корзины' });
  };

  const updateCategory = (id: string, category: SpendingCategory) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, category } : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsByEmployee = items.reduce((acc, item) => {
    if (!acc[item.addedBy]) acc[item.addedBy] = [];
    acc[item.addedBy].push(item);
    return acc;
  }, {} as Record<string, CartItemDisplay[]>);

  const handleOrder = () => {
    toast({
      title: 'Заказ оформлен!',
      description: `Заказ на ${totalAmount.toLocaleString()} ₽ будет доставлен сегодня`
    });
    navigate('/organization');
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
            <h1 className="text-lg font-bold text-foreground">Совместная корзина</h1>
            <p className="text-xs text-muted-foreground">{items.length} товаров</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-32">
        {/* Deadline Timer */}
        <section className={`rounded-2xl p-4 ${isDeadlineSoon ? 'bg-destructive/10 border border-destructive/30' : 'bg-primary/10 border border-primary/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDeadlineSoon ? 'bg-destructive/20' : 'bg-primary/20'}`}>
              <Clock className={`h-5 w-5 ${isDeadlineSoon ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {isDeadlineSoon ? 'Скоро дедлайн!' : 'До автозаказа'}
              </p>
              <p className="text-sm text-muted-foreground">
                Товары накидываем до 11:00, заказ оформляется в 11:15
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {timeUntilDeadline.hours}:{timeUntilDeadline.minutes.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </section>

        {/* Items grouped by employee */}
        {Object.entries(itemsByEmployee).map(([employee, employeeItems]) => (
          <section key={employee} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/50 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {employeeItems[0].addedByAvatar}
              </div>
              <span className="font-medium">{employee}</span>
              <Badge variant="secondary" className="ml-auto">
                {employeeItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()} ₽
              </Badge>
            </div>

            <div className="divide-y divide-border">
              {employeeItems.map((item) => {
                const CategoryIcon = categoryLabels[item.category].icon;
                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                        {item.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.price} ₽</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Select 
                            value={item.category} 
                            onValueChange={(v) => updateCategory(item.id, v as SpendingCategory)}
                          >
                            <SelectTrigger className="h-7 w-32 text-xs">
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(categoryLabels).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold">{(item.price * item.quantity).toLocaleString()} ₽</span>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive h-7"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Корзина пуста</h3>
            <p className="text-sm text-muted-foreground">
              Добавьте товары из каталога или готовых обедов
            </p>
            <Button variant="hero" className="mt-4" onClick={() => navigate('/ready-meals')}>
              Выбрать обеды
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Summary */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Итого ({items.length} товаров)</p>
              <p className="text-2xl font-bold">{totalAmount.toLocaleString()} ₽</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{Object.keys(itemsByEmployee).length} участников</span>
            </div>
          </div>

          {(isAdmin || isManager) ? (
            <Button variant="hero" size="lg" className="w-full" onClick={handleOrder}>
              <Check className="h-5 w-5 mr-2" />
              Оформить заказ сейчас
            </Button>
          ) : (
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                Заказ будет оформлен автоматически в 11:15
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
