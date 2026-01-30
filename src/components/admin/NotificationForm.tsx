import { useState, useEffect } from 'react';
import { Send, Users, Clock, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type NotificationType = 'push' | 'email';
type Audience = 'all' | 'paid' | 'solo' | 'family' | 'corp';
type ActivityFilter = 'all' | 'active_7d' | 'active_30d' | 'inactive_7d' | 'inactive_30d';

interface NotificationFormProps {
  type: NotificationType;
  onResult?: (result: { sent: number; failed: number; total: number }) => void;
}

export function NotificationForm({ type, onResult }: NotificationFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [audience, setAudience] = useState<Audience>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [hasEmailFilter, setHasEmailFilter] = useState(false);
  const [hasPushFilter, setHasPushFilter] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [isSending, setIsSending] = useState(false);
  const [isCountingAudience, setIsCountingAudience] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);

  const isPush = type === 'push';

  // Reset audience count when filters change
  useEffect(() => {
    setAudienceCount(null);
  }, [audience, activityFilter, hasEmailFilter, hasPushFilter]);

  const handleCountAudience = async () => {
    setIsCountingAudience(true);
    try {
      const { data, error } = await supabase.functions.invoke('count-notification-audience', {
        body: {
          type,
          audience,
          activityFilter,
          hasEmailFilter,
          hasPushFilter,
        }
      });

      if (error) throw error;

      setAudienceCount(data.count);
      toast.success(`Получателей: ${data.count}`);
    } catch (error) {
      console.error('Error counting audience:', error);
      toast.error('Ошибка при подсчёте аудитории');
    } finally {
      setIsCountingAudience(false);
    }
  };

  const handleSend = async () => {
    if (!title || !body) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        toast.error('Укажите дату и время отправки');
        return;
      }

      // Schedule the notification
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Необходима авторизация');
        return;
      }

      const { error } = await supabase
        .from('scheduled_notifications')
        .insert({
          type,
          title,
          body,
          html_content: isPush ? null : wrapEmailContent(body),
          url: isPush ? url : null,
          audience,
          activity_filter: activityFilter,
          has_email_filter: hasEmailFilter,
          has_push_filter: hasPushFilter,
          scheduled_at: scheduledAt,
          created_by: user.id,
        });

      if (error) {
        console.error('Error scheduling notification:', error);
        toast.error('Ошибка при планировании');
        return;
      }

      toast.success('Рассылка запланирована');
      resetForm();
      return;
    }

    setIsSending(true);
    try {
      const functionName = isPush ? 'send-mass-push' : 'send-mass-email';
      
      const payload: any = {
        audience,
        activityFilter,
        hasEmailFilter,
        hasPushFilter,
      };

      if (isPush) {
        payload.title = title;
        payload.body = body;
        payload.url = url || '/';
        payload.tag = 'admin-broadcast';
      } else {
        payload.subject = title;
        payload.htmlContent = wrapEmailContent(body);
        payload.textContent = body;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) throw error;

      onResult?.({
        sent: data.sent || 0,
        failed: data.failed || 0,
        total: data.total || 0,
      });

      if (data.sent > 0) {
        toast.success(`Отправлено: ${data.sent} из ${data.total}`);
        resetForm();
      } else if (data.total === 0) {
        toast.info('Нет получателей для выбранной аудитории');
      } else {
        toast.error('Не удалось отправить');
      }
    } catch (error) {
      console.error(`Error sending ${type}:`, error);
      toast.error('Ошибка при отправке');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setUrl('/');
    setIsScheduled(false);
    setScheduledDate('');
    setScheduledTime('12:00');
    setAudienceCount(null);
  };

  const wrapEmailContent = (text: string) => `
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
        ${text.replace(/\n/g, '<br>')}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Vigoda. Все права защищены.</p>
      </div>
    </body>
    </html>
  `;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isPush ? 'Push-уведомление' : 'Email-рассылка'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audience Selection */}
        <div className="grid gap-2">
          <Label>Аудитория (подписка)</Label>
          <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
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

        {/* Activity Filter */}
        <div className="grid gap-2">
          <Label>Активность</Label>
          <Select value={activityFilter} onValueChange={(v) => setActivityFilter(v as ActivityFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Фильтр по активности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active_7d">Активные за 7 дней</SelectItem>
              <SelectItem value="active_30d">Активные за 30 дней</SelectItem>
              <SelectItem value="inactive_7d">Неактивные 7+ дней</SelectItem>
              <SelectItem value="inactive_30d">Неактивные 30+ дней</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={hasEmailFilter}
              onCheckedChange={setHasEmailFilter}
              id="email-filter"
            />
            <Label htmlFor="email-filter" className="text-sm">Только с email</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={hasPushFilter}
              onCheckedChange={setHasPushFilter}
              id="push-filter"
            />
            <Label htmlFor="push-filter" className="text-sm">Только с push</Label>
          </div>
        </div>

        {/* Dry-run: Count Audience */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCountAudience}
            disabled={isCountingAudience}
          >
            {isCountingAudience ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Предпросмотр
          </Button>
          {audienceCount !== null && (
            <span className="text-sm text-muted-foreground">
              Получателей: <strong>{audienceCount}</strong>
            </span>
          )}
        </div>

        {/* Push URL */}
        {isPush && (
          <div className="grid gap-2">
            <Label>Ссылка при клике</Label>
            <Input
              placeholder="/ (или /promos, /meal-plans и т.д.)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSending}
            />
          </div>
        )}

        {/* Title/Subject */}
        <Input
          placeholder={isPush ? "Заголовок уведомления" : "Тема письма"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSending}
        />

        {/* Body/Content */}
        <Textarea
          placeholder={isPush ? "Текст уведомления..." : "Содержание письма..."}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={isPush ? 3 : 6}
          disabled={isSending}
        />

        {/* Schedule Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={isScheduled}
            onCheckedChange={setIsScheduled}
            id="schedule-toggle"
          />
          <Label htmlFor="schedule-toggle">Запланировать</Label>
        </div>

        {/* Schedule Date/Time */}
        {isScheduled && (
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Дата</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid gap-2">
              <Label>Время</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={handleSend}
            disabled={isSending || !title || !body}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isScheduled ? (
              <Clock className="h-4 w-4 mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isScheduled ? 'Запланировать' : 'Отправить'}
          </Button>
          <Button variant="outline" disabled>
            <Users className="h-4 w-4 mr-2" />
            Выбрать
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
