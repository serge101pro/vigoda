import { Navigate } from 'react-router-dom';
import { Bell, Mail, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BackButton } from '@/components/common/BackButton';
import { useSuperadmin } from '@/hooks/useSuperadmin';
import { NotificationForm } from '@/components/admin/NotificationForm';
import { ScheduledNotificationsList } from '@/components/admin/ScheduledNotificationsList';

export default function AdminNotificationsPage() {
  const { isSuperadmin, loading: superadminLoading } = useSuperadmin();

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
            <NotificationForm type="push" />
          </TabsContent>

          <TabsContent value="email" className="mt-4 space-y-4">
            <NotificationForm type="email" />
          </TabsContent>
        </Tabs>

        {/* Scheduled & Recent Notifications */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">История рассылок</h2>
          <ScheduledNotificationsList />
        </section>
      </main>
    </div>
  );
}
