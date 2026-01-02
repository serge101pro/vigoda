import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, ShoppingBag, Clock, CreditCard, Wallet, Info, Check, AlertCircle, ChevronDown, Home, Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useAppStore } from '@/stores/useAppStore';
import { stores } from '@/data/storesData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Saved addresses interface
interface SavedAddress {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  address: string;
  details?: string;
}

interface StoreDeliveryInfo {
  storeId: string;
  storeName: string;
  storeLogo: string;
  storeColor: string;
  subtotal: number;
  minDeliveryAmount: number;
  deliveryFee: number;
  canDeliver: boolean;
  amountToMinimum: number;
  products: { name: string; price: number; quantity: number }[];
}

// Mock minimum delivery amounts per store
const storeDeliveryConfig: Record<string, { minAmount: number; deliveryFee: number; freeDeliveryFrom: number }> = {
  'pyaterochka': { minAmount: 500, deliveryFee: 99, freeDeliveryFrom: 1500 },
  'magnit': { minAmount: 600, deliveryFee: 149, freeDeliveryFrom: 2000 },
  'perekrestok': { minAmount: 800, deliveryFee: 0, freeDeliveryFrom: 1500 },
  'lenta': { minAmount: 1000, deliveryFee: 199, freeDeliveryFrom: 3000 },
  'vkusvill': { minAmount: 400, deliveryFee: 0, freeDeliveryFrom: 1000 },
  'auchan': { minAmount: 1500, deliveryFee: 299, freeDeliveryFrom: 5000 },
  'svetofor': { minAmount: 0, deliveryFee: 0, freeDeliveryFrom: 0 }, // Self-pickup only
  'metro': { minAmount: 2000, deliveryFee: 0, freeDeliveryFrom: 2000 },
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useAppStore();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'sbp'>('card');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('asap');
  const [selectedDate, setSelectedDate] = useState<string>('today');

  // Time slots
  const timeSlots = [
    { id: 'asap', label: 'Ближайшее время', description: '30-60 минут' },
    { id: '10-12', label: '10:00 - 12:00', description: 'Утро' },
    { id: '12-14', label: '12:00 - 14:00', description: 'Обед' },
    { id: '14-16', label: '14:00 - 16:00', description: 'День' },
    { id: '16-18', label: '16:00 - 18:00', description: 'Вечер' },
    { id: '18-20', label: '18:00 - 20:00', description: 'Вечер' },
    { id: '20-22', label: '20:00 - 22:00', description: 'Поздний вечер' },
  ];

  const deliveryDates = [
    { id: 'today', label: 'Сегодня' },
    { id: 'tomorrow', label: 'Завтра' },
    { id: 'day-after', label: 'Послезавтра' },
  ];

  // Saved addresses (mock - would come from profile/Supabase)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    { id: '1', type: 'home', label: 'Дом', address: 'ул. Пушкина, д. 10, кв. 25', details: 'Подъезд 2, этаж 5' },
    { id: '2', type: 'work', label: 'Работа', address: 'БЦ Москва-Сити, Башня Федерация', details: 'Офис 4512' },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const { user } = useAuth();

  // Select saved address
  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setAddress(addr.address);
    if (addr.details) {
      const parts = addr.details.split(',').map(p => p.trim());
      // Try to parse apartment, entrance, floor from details
      parts.forEach(part => {
        if (part.toLowerCase().includes('кв') || part.toLowerCase().includes('офис')) {
          setApartment(part.replace(/[^\d]/g, '') || part);
        }
        if (part.toLowerCase().includes('подъезд') || part.toLowerCase().includes('парадная')) {
          setEntrance(part.replace(/[^\d]/g, ''));
        }
        if (part.toLowerCase().includes('этаж')) {
          setFloor(part.replace(/[^\d]/g, ''));
        }
      });
    }
    setShowAddressSelector(false);
  };

  const addressIcons: Record<string, React.ElementType> = {
    home: Home,
    work: Briefcase,
    other: MapPin,
  };

  // Group products by store and calculate delivery eligibility
  const storeDeliveryInfo = useMemo<StoreDeliveryInfo[]>(() => {
    const storeMap = new Map<string, StoreDeliveryInfo>();
    
    // Filter only store products
    const storeItems = cart.filter(item => 
      item.type === 'product' || item.type === 'recipe-ingredients'
    );

    // Distribute products to stores (same logic as shopping route)
    storeItems.forEach((item) => {
      const storeIds = ['pyaterochka', 'magnit', 'vkusvill'];
      const storeId = storeIds[Math.floor(Math.random() * storeIds.length)];
      const store = stores.find(s => s.id === storeId);
      
      if (store && item.product) {
        const config = storeDeliveryConfig[storeId] || { minAmount: 500, deliveryFee: 99, freeDeliveryFrom: 1500 };
        const existing = storeMap.get(storeId);
        const product = { name: item.product.name, price: item.product.price, quantity: item.quantity };
        
        if (existing) {
          existing.products.push(product);
          existing.subtotal += item.product.price * item.quantity;
          existing.canDeliver = existing.subtotal >= config.minAmount;
          existing.amountToMinimum = Math.max(0, config.minAmount - existing.subtotal);
          existing.deliveryFee = existing.subtotal >= config.freeDeliveryFrom ? 0 : config.deliveryFee;
        } else {
          const subtotal = item.product.price * item.quantity;
          storeMap.set(storeId, {
            storeId,
            storeName: store.name,
            storeLogo: store.logo,
            storeColor: store.color,
            subtotal,
            minDeliveryAmount: config.minAmount,
            deliveryFee: subtotal >= config.freeDeliveryFrom ? 0 : config.deliveryFee,
            canDeliver: subtotal >= config.minAmount,
            amountToMinimum: Math.max(0, config.minAmount - subtotal),
            products: [product],
          });
        }
      }
    });

    return Array.from(storeMap.values());
  }, [cart]);

  const deliverableStores = storeDeliveryInfo.filter(s => s.canDeliver);
  const pickupOnlyStores = storeDeliveryInfo.filter(s => !s.canDeliver);

  const subtotal = storeDeliveryInfo.reduce((sum, s) => sum + s.subtotal, 0);
  const deliveryFees = deliveryMethod === 'delivery' 
    ? deliverableStores.reduce((sum, s) => sum + s.deliveryFee, 0)
    : 0;
  const total = subtotal + deliveryFees;

  const handleSubmit = async () => {
    if (deliveryMethod === 'delivery' && !address.trim()) {
      toast.error('Укажите адрес доставки');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate order creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Заказ успешно оформлен!', {
      description: `Сумма заказа: ${total.toLocaleString()}₽`,
    });
    
    clearCart();
    navigate('/');
  };

  if (cart.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Корзина пуста</h1>
        <p className="text-muted-foreground text-center mb-6">
          Добавьте товары для оформления заказа
        </p>
        <Button onClick={() => navigate('/catalog')}>
          Перейти в каталог
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Оформление заказа</h1>
          <div className="w-10" />
        </div>
      </header>

      <Breadcrumbs />

      {/* Delivery Method */}
      <section className="px-4 py-4">
        <h2 className="font-bold text-lg mb-3">Способ получения</h2>
        <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as 'delivery' | 'pickup')}>
          <div className="space-y-2">
            <Label
              htmlFor="delivery"
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                deliveryMethod === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="delivery" id="delivery" />
              <Truck className="h-5 w-5" />
              <div className="flex-1">
                <span className="font-medium">Доставка</span>
                {deliverableStores.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Доступна для {deliverableStores.length} из {storeDeliveryInfo.length} магазинов
                  </p>
                )}
              </div>
            </Label>
            
            <Label
              htmlFor="pickup"
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                deliveryMethod === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="pickup" id="pickup" />
              <ShoppingBag className="h-5 w-5" />
              <div className="flex-1">
                <span className="font-medium">Самовывоз</span>
                <p className="text-xs text-muted-foreground">Из всех магазинов</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </section>

      {/* Stores Breakdown */}
      <section className="px-4 py-2">
        <h2 className="font-bold text-lg mb-3">Магазины</h2>
        <div className="space-y-3">
          {storeDeliveryInfo.map((info) => (
            <div
              key={info.storeId}
              className={`bg-card rounded-xl border p-4 ${
                deliveryMethod === 'delivery' && !info.canDeliver 
                  ? 'border-amber-500/50 bg-amber-500/5' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${info.storeColor} flex items-center justify-center text-lg`}>
                  {info.storeLogo}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{info.storeName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {info.products.length} товаров
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{info.subtotal.toLocaleString()}₽</div>
                  {deliveryMethod === 'delivery' && info.canDeliver && (
                    <div className="text-xs text-muted-foreground">
                      {info.deliveryFee > 0 ? `+ ${info.deliveryFee}₽ доставка` : 'Бесплатная доставка'}
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery status */}
              {deliveryMethod === 'delivery' && (
                <div className={`flex items-center gap-2 text-sm mt-2 pt-2 border-t border-border ${
                  info.canDeliver ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {info.canDeliver ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Доставка доступна</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Добавьте товаров на {info.amountToMinimum.toLocaleString()}₽ для доставки
                        (мин. {info.minDeliveryAmount.toLocaleString()}₽)
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pickup-only stores warning */}
        {deliveryMethod === 'delivery' && pickupOnlyStores.length > 0 && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-700">
                  {pickupOnlyStores.length} магазин(ов) только самовывоз
                </p>
                <p className="text-amber-600">
                  Товары из этих магазинов нужно будет забрать самостоятельно
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Delivery Address */}
      {deliveryMethod === 'delivery' && (
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Адрес доставки</h2>
            {user && (
              <Link to="/addresses" className="text-sm text-primary hover:underline">
                Мои адреса
              </Link>
            )}
          </div>

          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowAddressSelector(!showAddressSelector)}
                className="w-full flex items-center justify-between p-3 bg-muted rounded-xl"
              >
                <span className="text-sm font-medium">
                  {selectedAddressId 
                    ? savedAddresses.find(a => a.id === selectedAddressId)?.label 
                    : 'Выбрать из сохранённых'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAddressSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showAddressSelector && (
                <div className="mt-2 space-y-2 animate-fade-in">
                  {savedAddresses.map((addr) => {
                    const Icon = addressIcons[addr.type] || MapPin;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                          selectedAddressId === addr.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedAddressId === addr.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{addr.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{addr.address}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    );
                  })}
                  <Link
                    to="/addresses"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить новый адрес
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Улица, дом"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setSelectedAddressId(null); }}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Квартира"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
              <Input
                placeholder="Подъезд"
                value={entrance}
                onChange={(e) => setEntrance(e.target.value)}
              />
              <Input
                placeholder="Этаж"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <Textarea
              placeholder="Комментарий для курьера"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>
        </section>
      )}

      {/* Delivery Time */}
      <section className="px-4 py-2">
        <h2 className="font-bold text-lg mb-3">Время доставки</h2>
        
        {/* Date selection */}
        <div className="flex gap-2 mb-3">
          {deliveryDates.map((date) => (
            <Button
              key={date.id}
              variant={selectedDate === date.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDate(date.id)}
              className="flex-1"
            >
              {date.label}
            </Button>
          ))}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedTimeSlot(slot.id)}
              className={`p-3 rounded-xl border text-left transition-colors ${
                selectedTimeSlot === slot.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${selectedTimeSlot === slot.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium text-sm ${selectedTimeSlot === slot.id ? 'text-primary' : ''}`}>
                  {slot.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{slot.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Payment Method */}
      <section className="px-4 py-4">
        <h2 className="font-bold text-lg mb-3">Способ оплаты</h2>
        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
          <div className="space-y-2">
            <Label
              htmlFor="card"
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Картой онлайн</span>
            </Label>
            
            <Label
              htmlFor="sbp"
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                paymentMethod === 'sbp' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="sbp" id="sbp" />
              <Wallet className="h-5 w-5" />
              <span className="font-medium">СБП</span>
            </Label>
            
            {deliveryMethod === 'pickup' && (
              <Label
                htmlFor="cash"
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="cash" id="cash" />
                <Wallet className="h-5 w-5" />
                <span className="font-medium">Наличными при получении</span>
              </Label>
            )}
          </div>
        </RadioGroup>
      </section>

      {/* Order Summary */}
      <section className="px-4 py-4">
        <div className="bg-muted rounded-2xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Товары</span>
            <span className="font-medium">{subtotal.toLocaleString()}₽</span>
          </div>
          {deliveryMethod === 'delivery' && deliveryFees > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Доставка</span>
              <span className="font-medium">{deliveryFees.toLocaleString()}₽</span>
            </div>
          )}
          {deliveryMethod === 'delivery' && deliveryFees === 0 && (
            <div className="flex justify-between text-green-600">
              <span>Доставка</span>
              <span className="font-medium">Бесплатно</span>
            </div>
          )}
          <div className="pt-3 border-t border-border flex justify-between">
            <span className="text-lg font-bold">Итого</span>
            <span className="text-lg font-bold">{total.toLocaleString()}₽</span>
          </div>
        </div>
      </section>

      {/* Fixed Bottom */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Оформляем...' : `Оформить заказ на ${total.toLocaleString()}₽`}
        </Button>
      </div>
    </div>
  );
}
