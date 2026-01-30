import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Shield, Key, Globe, 
  Palette, Bell, Save, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    emailVerification: true,
    pushNotifications: true,
    analyticsEnabled: true,
    debugMode: false,
  });

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

  const handleSave = () => {
    toast.success('Настройки сохранены');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Настройки</h1>
              <p className="text-sm text-muted-foreground">Системные параметры</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Общие
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Режим обслуживания</Label>
                <p className="text-sm text-muted-foreground">Сайт будет недоступен для пользователей</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Режим отладки</Label>
                <p className="text-sm text-muted-foreground">Расширенное логирование</p>
              </div>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(checked) => setSettings({...settings, debugMode: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Безопасность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Открытая регистрация</Label>
                <p className="text-sm text-muted-foreground">Новые пользователи могут регистрироваться</p>
              </div>
              <Switch
                checked={settings.registrationOpen}
                onCheckedChange={(checked) => setSettings({...settings, registrationOpen: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Подтверждение Email</Label>
                <p className="text-sm text-muted-foreground">Требовать подтверждение почты</p>
              </div>
              <Switch
                checked={settings.emailVerification}
                onCheckedChange={(checked) => setSettings({...settings, emailVerification: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push-уведомления</Label>
                <p className="text-sm text-muted-foreground">Глобально включить/выключить</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Аналитика</Label>
                <p className="text-sm text-muted-foreground">Сбор анонимной статистики</p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => setSettings({...settings, analyticsEnabled: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Ключи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Telegram Bot Token</Label>
              <Input type="password" value="••••••••••••••" disabled className="mt-1" />
            </div>
            <div>
              <Label>VAPID Public Key</Label>
              <Input type="password" value="••••••••••••••" disabled className="mt-1" />
            </div>
            <p className="text-sm text-muted-foreground">
              Ключи настраиваются в Supabase Edge Functions Secrets
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button className="w-full" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Сохранить настройки
        </Button>
      </main>
    </div>
  );
}
