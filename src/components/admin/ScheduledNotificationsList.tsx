import { useState, useEffect } from 'react';
import { Bell, Mail, Clock, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScheduledNotification {
  id: string;
  type: 'push' | 'email';
  title: string;
  body: string;
  audience: string;
  activity_filter: string | null;
  scheduled_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  sent_count: number;
  failed_count: number;
  total_count: number;
  created_at: string;
  error_message: string | null;
}

export function ScheduledNotificationsList() {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .order('scheduled_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Cast to expected type since Supabase types might not include the new table yet
      setNotifications((data || []) as unknown as ScheduledNotification[]);
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Рассылка отменена');
      fetchNotifications();
    } catch (error) {
      console.error('Error cancelling notification:', error);
      toast.error('Ошибка при отмене');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Ожидает
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Отправка
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Отправлено
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Ошибка
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
            <XCircle className="h-3 w-3 mr-1" />
            Отменено
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAudienceLabel = (audience: string, activityFilter: string | null) => {
    const audienceLabels: Record<string, string> = {
      'all': 'Все',
      'paid': 'Платные',
      'solo': 'Solo',
      'family': 'Family',
      'corp': 'Corp',
    };

    const activityLabels: Record<string, string> = {
      'active_7d': 'активные 7д',
      'active_30d': 'активные 30д',
      'inactive_7d': 'неактивные 7д+',
      'inactive_30d': 'неактивные 30д+',
    };

    let label = audienceLabels[audience] || audience;
    if (activityFilter && activityFilter !== 'all') {
      label += ` (${activityLabels[activityFilter] || activityFilter})`;
    }
    return label;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет запланированных или отправленных рассылок
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif) => (
        <Card key={notif.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.type === 'push' ? 'bg-blue-500/10' : 'bg-purple-500/10'
              }`}>
                {notif.type === 'push' 
                  ? <Bell className="h-5 w-5 text-blue-500" />
                  : <Mail className="h-5 w-5 text-purple-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{notif.title}</h3>
                  {getStatusBadge(notif.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {notif.body}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>
                    {format(new Date(notif.scheduled_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                  </span>
                  <span>•</span>
                  <span>{getAudienceLabel(notif.audience, notif.activity_filter)}</span>
                  {notif.status === 'completed' && (
                    <>
                      <span>•</span>
                      <span>{notif.sent_count} отправлено</span>
                    </>
                  )}
                  {notif.error_message && (
                    <>
                      <span>•</span>
                      <span className="text-red-500">{notif.error_message}</span>
                    </>
                  )}
                </div>
              </div>
              {notif.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCancel(notif.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
