import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Mail, Send, Users, 
  Clock, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');

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

  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) {
      toast.error('Заполните все поля');
      return;
    }
    toast.success('Рассылка запланирована');
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendPush = () => {
    if (!pushTitle || !pushBody) {
      toast.error('Заполните все поля');
      return;
    }
    toast.success('Push-уведомление отправлено');
    setPushTitle('');
    setPushBody('');
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
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
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
                <Input
                  placeholder="Заголовок уведомления"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Текст уведомления..."
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleSendPush}>
                    <Send className="h-4 w-4 mr-2" />
                    Отправить всем
                  </Button>
                  <Button variant="outline">
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
                <Input
                  placeholder="Тема письма"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
                <Textarea
                  placeholder="Содержание письма..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleSendEmail}>
                    <Send className="h-4 w-4 mr-2" />
                    Отправить рассылку
                  </Button>
                  <Button variant="outline">
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
