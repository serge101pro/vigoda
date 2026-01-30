import { useState } from 'react';
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SubscriptionPlan = 'free' | 'solo' | 'family' | 'corp';

interface ChangePlanModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    user_id: string;
    display_name: string | null;
    email: string | null;
    currentPlan?: string;
  };
  onSuccess: () => void;
}

const planLabels: Record<SubscriptionPlan, string> = {
  free: 'Выгода (бесплатный)',
  solo: 'Персона',
  family: 'Семья',
  corp: 'Бизнес',
};

const planColors: Record<SubscriptionPlan, string> = {
  free: 'bg-muted text-muted-foreground',
  solo: 'bg-green-500/10 text-green-600',
  family: 'bg-purple-500/10 text-purple-600',
  corp: 'bg-orange-500/10 text-orange-600',
};

export function ChangePlanModal({ open, onClose, user, onSuccess }: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    (user.currentPlan as SubscriptionPlan) || 'free'
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleProceed = () => {
    if (selectedPlan === user.currentPlan) {
      toast.info('Тариф не изменился');
      onClose();
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      // Check if subscription exists
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (existingSub) {
        // Update existing subscription using service role would be needed
        // For now, we'll delete and re-create
        await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', user.user_id);
      }

      // Insert new subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.user_id,
          plan: selectedPlan,
          is_active: true,
          started_at: new Date().toISOString(),
          expires_at: selectedPlan === 'free' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast.success(`Тариф пользователя ${user.display_name || user.email} изменён на "${planLabels[selectedPlan]}"`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Ошибка при изменении тарифа');
    } finally {
      setSaving(false);
      setShowConfirmation(false);
    }
  };

  const handleClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Изменить тариф
              </DialogTitle>
              <DialogDescription>
                Пользователь: <span className="font-medium text-foreground">{user.display_name || user.email}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Текущий тариф:</p>
                <Badge className={planColors[(user.currentPlan as SubscriptionPlan) || 'free']}>
                  {planLabels[(user.currentPlan as SubscriptionPlan) || 'free']}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Новый тариф:</p>
                <Select value={selectedPlan} onValueChange={(v) => handleSelectPlan(v as SubscriptionPlan)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                        Выгода (бесплатный)
                      </div>
                    </SelectItem>
                    <SelectItem value="solo">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Персона
                      </div>
                    </SelectItem>
                    <SelectItem value="family">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Семья
                      </div>
                    </SelectItem>
                    <SelectItem value="corp">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        Бизнес
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button onClick={handleProceed}>
                Продолжить
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Подтверждение изменения
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-sm">
                  Вы уверены, что хотите изменить тариф пользователя{' '}
                  <span className="font-semibold">{user.display_name || user.email}</span>?
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Было</p>
                  <Badge className={planColors[(user.currentPlan as SubscriptionPlan) || 'free']}>
                    {planLabels[(user.currentPlan as SubscriptionPlan) || 'free']}
                  </Badge>
                </div>
                <span className="text-2xl">→</span>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Станет</p>
                  <Badge className={planColors[selectedPlan]}>
                    {planLabels[selectedPlan]}
                  </Badge>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={saving}>
                Назад
              </Button>
              <Button onClick={handleConfirm} disabled={saving} variant="hero">
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Подтвердить изменение
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
