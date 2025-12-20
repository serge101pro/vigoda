import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Eye, Calendar, Check, Clock, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate: string;
  createdAt: string;
}

interface UPDDocument {
  id: string;
  number: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  createdAt: string;
}

// Mock data
const mockInvoices: Invoice[] = [
  { id: '1', number: 'СЧ-2024-001', amount: 50000, status: 'pending', dueDate: '2024-12-25', createdAt: '2024-12-15' },
  { id: '2', number: 'СЧ-2024-002', amount: 75000, status: 'paid', dueDate: '2024-12-10', createdAt: '2024-12-01' },
  { id: '3', number: 'СЧ-2024-003', amount: 30000, status: 'paid', dueDate: '2024-11-25', createdAt: '2024-11-15' },
];

const mockUPDs: UPDDocument[] = [
  { id: '1', number: 'УПД-2024-011', periodStart: '2024-11-01', periodEnd: '2024-11-30', amount: 95500, createdAt: '2024-12-01' },
  { id: '2', number: 'УПД-2024-010', periodStart: '2024-10-01', periodEnd: '2024-10-31', amount: 88200, createdAt: '2024-11-01' },
  { id: '3', number: 'УПД-2024-009', periodStart: '2024-09-01', periodEnd: '2024-09-30', amount: 72100, createdAt: '2024-10-01' },
];

const statusConfig = {
  pending: { label: 'Ожидает оплаты', variant: 'secondary' as const, icon: Clock },
  paid: { label: 'Оплачен', variant: 'default' as const, icon: Check },
  cancelled: { label: 'Отменён', variant: 'destructive' as const, icon: AlertCircle },
};

export default function OrganizationDocumentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (type: 'invoice' | 'upd', id: string) => {
    try {
      setIsGenerating(true);
      
      // Call edge function to generate PDF
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: { type, documentId: id }
      });

      if (error) throw error;

      toast({
        title: 'Документ готов',
        description: 'Файл скачивается...'
      });

      // In real implementation, this would download the PDF
      // For demo, we just show a success message
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать документ',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoiceAmount || Number(newInvoiceAmount) <= 0) {
      toast({
        title: 'Укажите сумму',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // In real implementation, this would create an invoice in the database
      // and generate a PDF via edge function
      
      toast({
        title: 'Счёт выставлен',
        description: `Счёт на ${Number(newInvoiceAmount).toLocaleString()} ₽ создан`
      });
      
      setShowNewInvoice(false);
      setNewInvoiceAmount('');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать счёт',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
          <h1 className="text-lg font-bold text-foreground flex-1">Документы</h1>
          <Button variant="hero" size="sm" onClick={() => setShowNewInvoice(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Выставить счёт
          </Button>
        </div>
      </header>

      <div className="px-4 py-4">
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-muted rounded-xl mb-4">
            <TabsTrigger value="invoices">Счета</TabsTrigger>
            <TabsTrigger value="upd">УПД</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-3">
            {mockInvoices.map((invoice) => {
              const status = statusConfig[invoice.status];
              const StatusIcon = status.icon;
              
              return (
                <div key={invoice.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{invoice.number}</span>
                      </div>
                      <p className="text-2xl font-bold">{invoice.amount.toLocaleString()} ₽</p>
                    </div>
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Создан: {formatDate(invoice.createdAt)}</span>
                    </div>
                    {invoice.status === 'pending' && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Clock className="h-4 w-4" />
                        <span>Оплатить до: {formatDate(invoice.dueDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownload('invoice', invoice.id)}
                      disabled={isGenerating}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Скачать PDF
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Просмотр
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* UPD Tab */}
          <TabsContent value="upd" className="space-y-3">
            <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4 mb-4">
              <p className="text-sm">
                <strong>УПД</strong> (Универсальный передаточный документ) формируется автоматически в конце каждого месяца и доступен для скачивания.
              </p>
            </div>

            {mockUPDs.map((upd) => (
              <div key={upd.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{upd.number}</span>
                    </div>
                    <p className="text-2xl font-bold">{upd.amount.toLocaleString()} ₽</p>
                  </div>
                  <Badge variant="secondary">
                    <Check className="h-3 w-3 mr-1" />
                    Сформирован
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>Период: {formatDate(upd.periodStart)} — {formatDate(upd.periodEnd)}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownload('upd', upd.id)}
                    disabled={isGenerating}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Скачать PDF
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Просмотр
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выставить счёт на оплату</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Сумма пополнения</Label>
              <Input
                type="number"
                placeholder="50000"
                value={newInvoiceAmount}
                onChange={(e) => setNewInvoiceAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Минимальная сумма: 10 000 ₽
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <h4 className="font-medium mb-2">Что произойдёт:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Счёт будет отправлен на корпоративную почту</li>
                <li>• После оплаты баланс пополнится автоматически</li>
                <li>• Срок оплаты: 10 рабочих дней</li>
              </ul>
            </div>

            <Button 
              variant="hero" 
              className="w-full"
              onClick={handleCreateInvoice}
              disabled={isGenerating}
            >
              {isGenerating ? 'Создание...' : `Выставить счёт на ${Number(newInvoiceAmount || 0).toLocaleString()} ₽`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
