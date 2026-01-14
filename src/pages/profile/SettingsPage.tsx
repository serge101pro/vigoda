import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, User, Phone, Mail, Send, MapPin, CreditCard, Shield, LogOut, Bell, Loader2, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTelegramNotify } from '@/hooks/useTelegramNotify';
import { toast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

const stores = ['Пятёрочка', 'Магнит', 'Перекрёсток', 'ВкусВилл'];
const dietaryOptions = ['Вегетарианство', 'Веганство', 'Без глютена', 'Без лактозы'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { sendWelcomeNotification } = useTelegramNotify();
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const previousTelegramId = useRef<string | null>(null);

  // Account
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    telegram_chat_id: '',
  });
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

  useEffect(() => {
    if (profile) {
      previousTelegramId.current = profile.telegram_chat_id;
      setFormData({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        telegram_chat_id: profile.telegram_chat_id || '',
      });
    }
  }, [profile]);

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

  const handleSendTestNotification = async () => {
    if (!user || !formData.telegram_chat_id) {
      toast({ title: 'Сначала укажите Telegram ID', variant: 'destructive' });
      return;
    }
    
    setSendingTest(true);
    const result = await sendWelcomeNotification(user.id);
    setSendingTest(false);
    
    if (result.success) {
      toast({ title: '✅ Тестовое уведомление отправлено!' });
    } else {
      toast({ title: 'Ошибка отправки уведомления', description: 'Проверьте правильность Telegram ID', variant: 'destructive' });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    const isNewTelegramId = !previousTelegramId.current && formData.telegram_chat_id;
    
    const success = await updateProfile({
      display_name: formData.display_name || null,
      phone: formData.phone || null,
      telegram_chat_id: formData.telegram_chat_id || null,
    });
    
    setSaving(false);
    
    if (success) {
      toast({ title: 'Профиль успешно сохранён' });
      
      // Send welcome notification if Telegram ID was just added
      if (isNewTelegramId) {
        const result = await sendWelcomeNotification(user.id);
        if (result.success) {
          toast({ title: '🎉 Приветственное уведомление отправлено в Telegram!' });
        }
        previousTelegramId.current = formData.telegram_chat_id;
      }
    } else {
      toast({ title: 'Ошибка при сохранении', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthenticated = !!user;

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
            <h1 className="text-xl font-bold text-foreground">Профиль и Настройки</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Account Settings - Only for authenticated users */}
        {isAuthenticated && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Настройки аккаунта
            </h2>
            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <AvatarUpload size="lg" />
              </div>
              
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Имя
                </Label>
                <Input 
                  id="name" 
                  value={formData.display_name} 
                  onChange={e => setFormData(prev => ({ ...prev, display_name: e.target.value }))} 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Телефон
                </Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                  className="mt-1" 
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input 
                  value={profile?.email || user?.email || ''} 
                  disabled 
                  className="mt-1 bg-muted" 
                />
                <p className="text-xs text-muted-foreground mt-1">Email нельзя изменить</p>
              </div>
              <div>
                <Label htmlFor="telegram" className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  Telegram
                </Label>
                <Input 
                  id="telegram" 
                  value={formData.telegram_chat_id} 
                  onChange={e => setFormData(prev => ({ ...prev, telegram_chat_id: e.target.value }))} 
                  className="mt-1" 
                  placeholder="Ваш Chat ID (например: 123456789)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Для получения уведомлений. Узнайте свой Chat ID у @userinfobot в Telegram
                </p>
                
                {formData.telegram_chat_id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleSendTestNotification}
                    disabled={sendingTest}
                  >
                    {sendingTest ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Отправить тестовое уведомление
                  </Button>
                )}
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Сохранить профиль
              </Button>
            </div>
          </section>
        )}

        {/* Program Settings */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Настройки программы</h2>
          
          {/* Language */}
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <Label>Язык</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Links to Sub-pages */}
          <div className="space-y-2">
            <Link to="/profile/notifications" className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <span className="font-medium">Настройка уведомлений</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
            
            <Link to="/recommendation-rules" className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">🤖</span>
                <span className="font-medium">Правила рекомендации товаров</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>

            <Link to="/profile/preferences" className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">🍽️</span>
                <span className="font-medium">Предпочтения и Ограничения</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>

            <Link to="/profile/addresses" className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Мои адреса</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>

            <Link to="/profile/payment-methods" className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-medium">Способы оплаты</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>

            <Link to="/profile/loyalty-cards" className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">💳</span>
                <span className="font-medium">Карты лояльности</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>

            <Link to="/privacy" className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">Конфиденциальность</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
          </div>
        </section>

        {/* Logout */}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="lg"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Выйти из аккаунта
          </Button>
        )}
      </div>
    </div>
  );
}
