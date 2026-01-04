import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const stores = ['Пятёрочка', 'Магнит', 'Перекрёсток', 'ВкусВилл'];
const dietaryOptions = ['Вегетарианство', 'Веганство', 'Без глютена', 'Без лактозы'];

export default function SettingsPage() {
  // Account
  const [name, setName] = useState('Александр');
  const [email, setEmail] = useState('alex@example.com');
  const [phone, setPhone] = useState('+7 999 123 45 67');
  const [language, setLanguage] = useState('ru');

  // Notifications
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [shoppingReminder, setShoppingReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [discountNotify, setDiscountNotify] = useState(true);
  const [priceRiseNotify, setPriceRiseNotify] = useState(true);
  const [familyUpdates, setFamilyUpdates] = useState(false);

  // Product recommendations
  const [recommendationType, setRecommendationType] = useState('cheapest');

  // Shopping preferences
  const [favoriteStores, setFavoriteStores] = useState(['Пятёрочка', 'Магнит', 'ВкусВилл']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState('45000');
  const [showCheaperAnalogs, setShowCheaperAnalogs] = useState(true);
  const [notifyPriceRise, setNotifyPriceRise] = useState(true);
  const [aiPredictions, setAiPredictions] = useState(true);

  // Privacy
  const [anonymousStats, setAnonymousStats] = useState(true);
  const [personalRecommendations, setPersonalRecommendations] = useState(true);
  const [geolocation, setGeolocation] = useState(true);

  const toggleStore = (store: string) => {
    setFavoriteStores(prev => 
      prev.includes(store) ? prev.filter(s => s !== store) : [...prev, store]
    );
  };

  const toggleDietary = (option: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

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
            <h1 className="text-xl font-bold text-foreground">Настройки</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-8">
        {/* Account Settings */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Настройки аккаунта</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Язык</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Уведомления</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Push-уведомления</span>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Email-уведомления</span>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Напоминания о покупках</span>
              <Switch checked={shoppingReminder} onCheckedChange={setShoppingReminder} />
            </div>
            {shoppingReminder && (
              <div className="relative ml-4">
                <Input 
                  type="time" 
                  value={reminderTime} 
                  onChange={e => setReminderTime(e.target.value)}
                  className="pr-10"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">Уведомления о скидках</span>
              <Switch checked={discountNotify} onCheckedChange={setDiscountNotify} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Оповещать о росте цен</span>
              <Switch checked={priceRiseNotify} onCheckedChange={setPriceRiseNotify} />
            </div>
            <div className="flex items-center justify-between opacity-50">
              <div>
                <span className="font-medium">Семейные обновления</span>
                <p className="text-xs text-muted-foreground">Доступно в Family плане</p>
              </div>
              <Switch checked={familyUpdates} onCheckedChange={setFamilyUpdates} disabled />
            </div>
          </div>
        </section>

        {/* Product Recommendations */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Рекомендации товаров</h2>
          <RadioGroup value={recommendationType} onValueChange={setRecommendationType} className="space-y-3">
            {[
              { value: 'cheapest', label: 'Самые дешёвые', desc: 'Показывать товары с минимальной ценой' },
              { value: 'previous', label: 'Ранее купленные', desc: 'Товары из вашей истории покупок' },
              { value: 'popular', label: 'Популярные у других', desc: 'Что чаще всего покупают пользователи' },
              { value: 'premium', label: 'Премиум качество', desc: 'Товары высокого качества' },
              { value: 'eco', label: 'Экологичные', desc: 'Органические и фермерские продукты' },
            ].map(opt => (
              <label 
                key={opt.value}
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  recommendationType === opt.value 
                    ? 'border-primary bg-primary-light' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={opt.value} className="mt-1" />
                <div>
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-sm text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>

          <div className="mt-4 bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Показывать аналоги дешевле</span>
              <Switch checked={showCheaperAnalogs} onCheckedChange={setShowCheaperAnalogs} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Уведомлять о росте цен</span>
              <Switch checked={notifyPriceRise} onCheckedChange={setNotifyPriceRise} />
            </div>
          </div>
        </section>

        {/* Shopping Preferences */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Предпочтения покупок</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div>
              <Label className="font-semibold">Любимые магазины</Label>
              <div className="mt-2 space-y-2">
                {stores.map(store => (
                  <label key={store} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={favoriteStores.includes(store)} 
                      onCheckedChange={() => toggleStore(store)} 
                    />
                    <span>{store}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-semibold">Диетические ограничения</Label>
              <div className="mt-2 space-y-2">
                {dietaryOptions.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox 
                      checked={dietaryRestrictions.includes(option)} 
                      onCheckedChange={() => toggleDietary(option)} 
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="budget">Месячный бюджет</Label>
              <div className="relative mt-1">
                <Input 
                  id="budget"
                  type="number" 
                  value={monthlyBudget} 
                  onChange={e => setMonthlyBudget(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Автодобавление предсказаний</span>
                <p className="text-xs text-muted-foreground">AI автоматически добавляет часто покупаемые товары</p>
              </div>
              <Switch checked={aiPredictions} onCheckedChange={setAiPredictions} />
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Конфиденциальность</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Анонимная статистика</span>
                <p className="text-xs text-muted-foreground">Помогает улучшить приложение</p>
              </div>
              <Switch checked={anonymousStats} onCheckedChange={setAnonymousStats} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Персональные рекомендации</span>
              <Switch checked={personalRecommendations} onCheckedChange={setPersonalRecommendations} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Геолокация</span>
                <p className="text-xs text-muted-foreground">Для поиска ближайших магазинов</p>
              </div>
              <Switch checked={geolocation} onCheckedChange={setGeolocation} />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4 text-destructive border-destructive hover:bg-destructive/10"
          >
            Удалить аккаунт
          </Button>
        </section>

        {/* Subscription */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Управление подпиской</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Текущий план</p>
            <p className="text-xl font-bold text-primary">Бесплатная</p>
            <Link to="/profile/premium">
              <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                Посмотреть планы
              </Button>
            </Link>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">О приложении</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 text-center border-b border-border">
              <p className="text-muted-foreground">v2.0.1</p>
            </div>
            {[
              { label: 'Условия использования', to: '/terms' },
              { label: 'Политика конфиденциальности', to: '/privacy' },
              { label: 'Помощь и поддержка', to: '/support' },
              { label: 'Политика обработки персональных данных', to: '/personal-data-policy' },
              { label: 'Публичная оферта', to: '/public-offer' },
              { label: 'Правила рекомендательных технологий', to: '/recommendation-rules' },
            ].map(item => (
              <Link 
                key={item.to} 
                to={item.to}
                className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <span>{item.label}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>

          <div className="mt-4 bg-muted rounded-2xl p-4">
            <p className="font-semibold">Связаться с нами:</p>
            <p className="text-muted-foreground">support@vigodnotut.ru</p>
          </div>
        </section>
      </div>
    </div>
  );
}
