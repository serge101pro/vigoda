import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Camera, Shield, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PermissionSettings {
  geolocation_enabled: boolean;
  camera_enabled: boolean;
  share_anonymous_stats: boolean;
  personal_recommendations: boolean;
}

export default function PermissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PermissionSettings>({
    geolocation_enabled: true,
    camera_enabled: false,
    share_anonymous_stats: true,
    personal_recommendations: true,
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
        .from('permission_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          geolocation_enabled: data.geolocation_enabled ?? true,
          camera_enabled: data.camera_enabled ?? false,
          share_anonymous_stats: data.share_anonymous_stats ?? true,
          personal_recommendations: data.personal_recommendations ?? true,
        });
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
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
        .from('permission_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({ title: 'Настройки сохранены', description: 'Ваши разрешения обновлены' });
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const requestGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSettings(prev => ({ ...prev, geolocation_enabled: true }));
          toast({ title: 'Геолокация разрешена' });
        },
        () => {
          toast({ title: 'Доступ к геолокации запрещён', variant: 'destructive' });
        }
      );
    }
  };

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setSettings(prev => ({ ...prev, camera_enabled: true }));
      toast({ title: 'Доступ к камере разрешён' });
    } catch {
      toast({ title: 'Доступ к камере запрещён', variant: 'destructive' });
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
            <Link to="/about">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Управление разрешениями</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Geolocation */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Геолокация</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Позволяет находить ближайшие магазины, строить маршруты и получать актуальные цены в вашем районе
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.geolocation_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, geolocation_enabled: checked }))}
                  />
                  <Label>{settings.geolocation_enabled ? 'Разрешено' : 'Запрещено'}</Label>
                </div>
                <Button variant="outline" size="sm" onClick={requestGeolocation}>
                  Запросить доступ
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Camera */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <Camera className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Камера</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Используется для сканирования штрих-кодов товаров и карт лояльности
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.camera_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, camera_enabled: checked }))}
                  />
                  <Label>{settings.camera_enabled ? 'Разрешено' : 'Запрещено'}</Label>
                </div>
                <Button variant="outline" size="sm" onClick={requestCamera}>
                  Запросить доступ
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Data */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Персональные данные</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Настройки обработки и использования ваших данных
              </p>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Анонимная статистика</p>
                    <p className="text-xs text-muted-foreground">Помогает улучшать приложение</p>
                  </div>
                  <Switch
                    checked={settings.share_anonymous_stats}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, share_anonymous_stats: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Персонализированные рекомендации</p>
                    <p className="text-xs text-muted-foreground">На основе ваших покупок</p>
                  </div>
                  <Switch
                    checked={settings.personal_recommendations}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, personal_recommendations: checked }))}
                  />
                </div>
              </div>
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

        {/* Info */}
        <div className="bg-muted/50 rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">
            Вы можете изменить разрешения в любое время. Отключение некоторых функций может ограничить возможности приложения.
          </p>
        </div>
      </div>
    </div>
  );
}
