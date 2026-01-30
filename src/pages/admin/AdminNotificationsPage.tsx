import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Bell, Mail, Send, Users, 
  Clock, CheckCircle, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackButton } from '@/components/common/BackButton';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationResult {
  sent: number;
  failed: number;
  total: number;
}

type Audience = 'all' | 'paid' | 'solo' | 'family' | 'corp';

export default function AdminNotificationsPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailAudience, setEmailAudience] = useState<Audience>('all');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('/');
  const [pushAudience, setPushAudience] = useState<Audience>('all');
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [lastPushResult, setLastPushResult] = useState<NotificationResult | null>(null);
  const [lastEmailResult, setLastEmailResult] = useState<NotificationResult | null>(null);

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

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      toast.error('Заполните все поля');
      return;
    }
    
    setIsSendingEmail(true);
    setLastEmailResult(null);
    
    try {
      // Wrap email body in simple HTML template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Vigoda</h1>
          </div>
          <div class="content">
            ${emailBody.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Vigoda. Все права защищены.</p>
            <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await supabase.functions.invoke('send-mass-email', {
        body: {
          subject: emailSubject,
          htmlContent,
          textContent: emailBody,
          audience: emailAudience,
        }
      });

      if (error) throw error;

      setLastEmailResult({
        sent: data.sent || 0,
        failed: data.failed || 0,
        total: data.total || 0,
      });

      if (data.sent > 0) {
        toast.success(`Email-рассылка отправлена: ${data.sent} из ${data.total}`);
        setEmailSubject('');
        setEmailBody('');
      } else if (data.total === 0) {
        toast.info('Нет пользователей с email-адресами для рассылки');
      } else {
        toast.error('Не удалось отправить рассылку');
      }
    } catch (error) {
      console.error('Error sending mass email:', error);
      toast.error('Ошибка при отправке рассылки');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendPush = async () => {
    if (!pushTitle || !pushBody) {
      toast.error('Заполните все поля');
      return;
    }
    
    setIsSendingPush(true);
    setLastPushResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-mass-push', {
        body: {
          title: pushTitle,
          body: pushBody,
          url: pushUrl || '/',
          tag: 'admin-broadcast',
          audience: pushAudience,
        }
      });

      if (error) throw error;

      setLastPushResult({
        sent: data.sent || 0,
        failed: data.failed || 0,
        total: data.total || 0,
      });

      if (data.sent > 0) {
        toast.success(`Push отправлен: ${data.sent} из ${data.total}`);
        setPushTitle('');
        setPushBody('');
      } else if (data.total === 0) {
        toast.info('Нет пользователей с push-подписками');
      } else {
        toast.error('Не удалось отправить уведомления');
      }
    } catch (error) {
      console.error('Error sending mass push:', error);
      toast.error('Ошибка при отправке push-уведомлений');
    } finally {
      setIsSendingPush(false);
    }
  };

  const recentNotifications = [
    { id: 1, type: 'push', title: 'Скидка 20% на все!', sent: '2ч назад', recipients: 1234, status: 'sent' },
    { id: 2, type: 'email', title: 'Новые рецепты недели', sent: '1д назад', recipients: 856, status: 'sent' },
    { id: 3, type: 'push', title: 'Акция выходного дня', sent: '3д назад', recipients: 2100, status: 'sent' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <BackButton fallbackPath="/admin" />
            <div>
              <h1 className="text-xl font-bold">Уведомления</h1>
              <p className="text-sm text-muted-foreground">Рассылки и push</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
        <Tabs defaultValue="push">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="push">
              <Bell className="h-4 w-4 mr-2" />
              Push
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Новое Push-уведомление</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Аудитория</Label>
                  <Select value={pushAudience} onValueChange={(v) => setPushAudience(v as Audience)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите аудиторию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все пользователи</SelectItem>
                      <SelectItem value="paid">Только платные</SelectItem>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="corp">Corp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Ссылка при клике</Label>
                  <Input
                    placeholder="/ (или /promos, /meal-plans и т.д.)"
                    value={pushUrl}
                    onChange={(e) => setPushUrl(e.target.value)}
                    disabled={isSendingPush}
                  />
                </div>

                <Input
                  placeholder="Заголовок уведомления"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  disabled={isSendingPush}
                />
                <Textarea
                  placeholder="Текст уведомления..."
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  rows={3}
                  disabled={isSendingPush}
                />
                
                {lastPushResult && (
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Отправлено: {lastPushResult.sent}</span>
                      {lastPushResult.failed > 0 && (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>Ошибок: {lastPushResult.failed}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleSendPush}
                    disabled={isSendingPush || !pushTitle || !pushBody}
                  >
                    {isSendingPush ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Отправить всем
                  </Button>
                  <Button variant="outline" disabled>
                    <Users className="h-4 w-4 mr-2" />
                    Выбрать
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Новая Email-рассылка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Аудитория</Label>
                  <Select value={emailAudience} onValueChange={(v) => setEmailAudience(v as Audience)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите аудиторию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все пользователи</SelectItem>
                      <SelectItem value="paid">Только платные</SelectItem>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="corp">Corp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder="Тема письма"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  disabled={isSendingEmail}
                />
                <Textarea
                  placeholder="Содержание письма..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  disabled={isSendingEmail}
                />
                
                {lastEmailResult && (
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Отправлено: {lastEmailResult.sent}</span>
                      {lastEmailResult.failed > 0 && (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>Ошибок: {lastEmailResult.failed}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || !emailSubject || !emailBody}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Отправить рассылку
                  </Button>
                  <Button variant="outline" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    Запланировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Notifications */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Последние рассылки</h2>
          {recentNotifications.map(notif => (
            <Card key={notif.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notif.type === 'push' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                  }`}>
                    {notif.type === 'push' 
                      ? <Bell className="h-5 w-5 text-blue-500" />
                      : <Mail className="h-5 w-5 text-purple-500" />
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{notif.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {notif.recipients} получателей • {notif.sent}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Отправлено
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
