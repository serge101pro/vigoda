import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Check, 
  X, 
  AlertTriangle,
  MessageSquare,
  User,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';

interface ApprovalRequest {
  id: string;
  orderNumber: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  comment?: string;
  approvedBy?: string;
}

// Demo data
const demoApprovals: ApprovalRequest[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-1240',
    employeeName: 'Дмитрий Сидоров',
    employeeAvatar: '👨‍💻',
    department: 'Разработка',
    total: 8500,
    items: [
      { name: 'Фуршет для команды', quantity: 1, price: 8500 },
    ],
    status: 'pending',
    createdAt: '2024-12-20T10:30:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-1239',
    employeeName: 'Елена Козлова',
    employeeAvatar: '👩‍🎨',
    department: 'Маркетинг',
    total: 12000,
    items: [
      { name: 'Кейтеринг презентация', quantity: 1, price: 12000 },
    ],
    status: 'pending',
    createdAt: '2024-12-20T09:15:00',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-1235',
    employeeName: 'Николай Федоров',
    employeeAvatar: '👨‍💼',
    department: 'Продажи',
    total: 6500,
    items: [
      { name: 'Бизнес-ланч для клиентов', quantity: 5, price: 6500 },
    ],
    status: 'approved',
    createdAt: '2024-12-19T14:20:00',
    approvedBy: 'Мария Петрова',
    comment: 'Одобрено для встречи с партнёрами',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-1230',
    employeeName: 'Анна Новикова',
    employeeAvatar: '👩‍💼',
    department: 'Бухгалтерия',
    total: 15000,
    items: [
      { name: 'Корпоратив отдела', quantity: 1, price: 15000 },
    ],
    status: 'rejected',
    createdAt: '2024-12-18T11:00:00',
    approvedBy: 'Александр Иванов',
    comment: 'Превышен бюджет отдела на мероприятия',
  },
];

const statusConfig = {
  pending: { label: 'Ожидает', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: Clock },
  approved: { label: 'Одобрен', color: 'bg-green-500/10 text-green-500 border-green-500/30', icon: Check },
  rejected: { label: 'Отклонён', color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: X },
};

export default function OrganizationApprovalsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization, isAdmin, isManager } = useOrganization();
  
  const [approvals, setApprovals] = useState(demoApprovals);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const canApprove = isAdmin || isManager || true; // true for demo

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  const handleAction = (approval: ApprovalRequest, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setActionType(action);
    setComment('');
    setShowActionDialog(true);
  };

  const processAction = async () => {
    if (!selectedApproval) return;

    setIsProcessing(true);
    try {
      // Update local state
      setApprovals(approvals.map(a => 
        a.id === selectedApproval.id
          ? { 
              ...a, 
              status: actionType === 'approve' ? 'approved' : 'rejected',
              approvedBy: 'Вы',
              comment: comment || undefined,
            }
          : a
      ));

      // Send Telegram notification
      if (organization?.id) {
        await supabase.functions.invoke('telegram-notify', {
          body: {
            type: actionType === 'approve' ? 'order_approved' : 'order_rejected',
            organizationId: organization.id,
            data: {
              orderNumber: selectedApproval.orderNumber,
              approverName: 'Менеджер',
              comment: comment,
              reason: comment,
            },
          },
        });
      }

      toast({
        title: actionType === 'approve' ? 'Заказ одобрен' : 'Заказ отклонён',
        description: `${selectedApproval.orderNumber} ${actionType === 'approve' ? 'одобрен' : 'отклонён'}`,
      });

      setShowActionDialog(false);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать заявку',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Согласование заказов</h1>
            <p className="text-xs text-muted-foreground">{pendingCount} ожидают решения</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Ожидают</p>
          </div>
          <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Одобрено</p>
          </div>
          <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Отклонено</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl mb-4">
            <TabsTrigger value="pending" className="relative">
              Ожидают
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Одобрено</TabsTrigger>
            <TabsTrigger value="rejected">Отклонено</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-3">
              {approvals
                .filter(a => a.status === status)
                .map((approval) => {
                  const statusConf = statusConfig[approval.status];
                  const StatusIcon = statusConf.icon;

                  return (
                    <div key={approval.id} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                          {approval.employeeAvatar}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate">{approval.employeeName}</p>
                            <Badge className={`${statusConf.color} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConf.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{approval.orderNumber}</span>
                            <span>•</span>
                            <span>{formatDate(approval.createdAt)}</span>
                          </div>
                          
                          <Badge variant="outline" className="text-xs mt-2">{approval.department}</Badge>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        {approval.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{item.name}</span>
                              {item.quantity > 1 && (
                                <span className="text-muted-foreground">×{item.quantity}</span>
                              )}
                            </div>
                            <span className="font-medium">{item.price.toLocaleString()} ₽</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                          <span className="font-medium">Итого:</span>
                          <span className="font-bold text-lg">{approval.total.toLocaleString()} ₽</span>
                        </div>
                      </div>

                      {/* Comment if exists */}
                      {approval.comment && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                          <MessageSquare className="h-4 w-4 mt-0.5" />
                          <div>
                            <span className="font-medium">{approval.approvedBy}:</span> {approval.comment}
                          </div>
                        </div>
                      )}

                      {/* Actions for pending */}
                      {approval.status === 'pending' && canApprove && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                            onClick={() => handleAction(approval, 'reject')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Отклонить
                          </Button>
                          <Button
                            variant="hero"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAction(approval, 'approve')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Одобрить
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}

              {approvals.filter(a => a.status === status).length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Нет заявок</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Info card */}
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <h4 className="font-medium mb-2">ℹ️ Как работает согласование</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Заказы свыше порога требуют одобрения менеджера</li>
            <li>• Уведомления приходят в Telegram</li>
            <li>• После одобрения заказ автоматически оформляется</li>
          </ul>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? '✅ Одобрить заказ' : '❌ Отклонить заказ'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {selectedApproval.employeeAvatar}
                  </div>
                  <div>
                    <p className="font-medium">{selectedApproval.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{selectedApproval.orderNumber}</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{selectedApproval.total.toLocaleString()} ₽</p>
              </div>

              <div>
                <Label>{actionType === 'approve' ? 'Комментарий (опционально)' : 'Причина отклонения'}</Label>
                <Textarea
                  placeholder={actionType === 'approve' ? 'Добавьте комментарий...' : 'Укажите причину отклонения...'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowActionDialog(false)}>
                  Отмена
                </Button>
                <Button
                  variant={actionType === 'approve' ? 'hero' : 'destructive'}
                  className="flex-1"
                  onClick={processAction}
                  disabled={isProcessing || (actionType === 'reject' && !comment)}
                >
                  {isProcessing ? 'Обработка...' : actionType === 'approve' ? 'Одобрить' : 'Отклонить'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
