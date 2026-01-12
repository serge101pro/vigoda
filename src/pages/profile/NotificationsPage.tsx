import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Check, Bell, Mail, Send, Clock, ShoppingCart, Tag, Users, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  telegram_enabled: boolean;
  shopping_reminders: boolean;
  reminder_time: string;
  discount_alerts: boolean;
  price_rise_alerts: boolean;
  family_updates: boolean;
  order_updates: boolean;
  promo_notifications: boolean;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    push_enabled: true,
    email_enabled: true,
    telegram_enabled: false,
    shopping_reminders: true,
    reminder_time: '18:00',
    discount_alerts: true,
    price_rise_alerts: true,
    family_updates: false,
    order_updates: true,
    promo_notifications: true,
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          push_enabled: data.push_enabled ?? true,
          email_enabled: data.email_enabled ?? true,
          telegram_enabled: data.telegram_enabled ?? false,
          shopping_reminders: data.shopping_reminders ?? true,
          reminder_time: data.reminder_time || '18:00',
          discount_alerts: data.discount_alerts ?? true,
          price_rise_alerts: data.price_rise_alerts ?? true,
          family_updates: data.family_updates ?? false,
          order_updates: data.order_updates ?? true,
          promo_notifications: data.promo_notifications ?? true,
        });
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Войдите в аккаунт', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({ title: 'Настройки уведомлений сохранены' });
    } catch (err) {
      console.error('Error saving notification settings:', err);
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Настройка уведомлений</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Notification Channels */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-bold text-foreground mb-4">Каналы уведомлений</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Push-уведомления</p>
                  <p className="text-xs text-muted-foreground">В приложении и браузере</p>
                </div>
              </div>
              <Switch
                checked={settings.push_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push_enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">На вашу почту</p>
                </div>
              </div>
              <Switch
                checked={settings.email_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <p className="font-medium">Telegram</p>
                  <p className="text-xs text-muted-foreground">Укажите @username в профиле</p>
                </div>
              </div>
              <Switch
                checked={settings.telegram_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, telegram_enabled: checked }))}
              />
            </div>
          </div>
        </section>

        {/* Notification Types */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-bold text-foreground mb-4">Типы уведомлений</h3>

          <div className="space-y-4">
            {/* Shopping Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <p className="font-medium">Напоминания о покупках</p>
                </div>
                <Switch
                  checked={settings.shopping_reminders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shopping_reminders: checked }))}
                />
              </div>
              {settings.shopping_reminders && (
                <div className="flex items-center gap-2 ml-8">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={settings.reminder_time}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminder_time: e.target.value }))}
                    className="w-32"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-green-500" />
                <p className="font-medium">Скидки и акции</p>
              </div>
              <Switch
                checked={settings.discount_alerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, discount_alerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-red-500" />
                <p className="font-medium">Рост цен</p>
              </div>
              <Switch
                checked={settings.price_rise_alerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, price_rise_alerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-500" />
                <p className="font-medium">Обновления семьи</p>
              </div>
              <Switch
                checked={settings.family_updates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, family_updates: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-500" />
                <p className="font-medium">Статус заказов</p>
              </div>
              <Switch
                checked={settings.order_updates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, order_updates: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-amber-500" />
                <p className="font-medium">Промо-уведомления</p>
              </div>
              <Switch
                checked={settings.promo_notifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, promo_notifications: checked }))}
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        {user && (
          <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Сохранить настройки
          </Button>
        )}

        {/* Info for non-authenticated users */}
        {!user && (
          <div className="bg-primary/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-foreground mb-3">
              Войдите в аккаунт, чтобы настроить уведомления
            </p>
            <Link to="/auth/login">
              <Button variant="hero">Войти</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
