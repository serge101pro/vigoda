import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Check, Lock, Shield, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'sbp' | 'card' | 'wallet' | 'bank-app' | 'invoice';
  b2bOnly?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'sbp', name: 'СБП', icon: '⚡', type: 'sbp' },
  { id: 'russian-card', name: 'Картой РФ банка', icon: '💳', type: 'card' },
  { id: 'foreign-card', name: 'Картой зарубежного банка', icon: '🌍', type: 'card' },
  { id: 'yandex-pay', name: 'Yandex Pay', icon: '🟡', type: 'wallet' },
  { id: 'sber-pay', name: 'SberPay', icon: '🟢', type: 'wallet' },
  { id: 'yoomoney', name: 'ЮMoney', icon: '🟣', type: 'wallet' },
  { id: 'invoice', name: 'Выставить счёт', icon: '📄', type: 'invoice', b2bOnly: true },
];

const bankApps = [
  { id: 'sber', name: 'Сбербанк', color: 'bg-green-500', icon: '🟢' },
  { id: 'tbank', name: 'Т-Банк', color: 'bg-yellow-400', icon: '🟡' },
  { id: 'alfa', name: 'Альфа-Банк', color: 'bg-red-500', icon: '🔴' },
  { id: 'vtb', name: 'ВТБ', color: 'bg-blue-600', icon: '🔵' },
  { id: 'raiffeisen', name: 'Райффайзен', color: 'bg-yellow-500', icon: '🟠' },
  { id: 'gazprom', name: 'Газпромбанк', color: 'bg-blue-500', icon: '⚪' },
  { id: 'otkritie', name: 'Открытие', color: 'bg-cyan-500', icon: '🔷' },
  { id: 'psb', name: 'ПСБ', color: 'bg-orange-500', icon: '🟧' },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { organization, isB2BUser } = useOrganization();
  
  const plan = searchParams.get('plan') || 'solo';
  const months = searchParams.get('months') || '1';
  const amount = searchParams.get('amount') || '399';

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showSmsVerification, setShowSmsVerification] = useState(false);
  const [showBankApps, setShowBankApps] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Filter payment methods based on B2B status
  const availablePaymentMethods = paymentMethods.filter(
    method => !method.b2bOnly || isB2BUser
  );

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    const method = paymentMethods.find(m => m.id === methodId);
    
    if (method?.type === 'card') {
      setShowCardForm(true);
    } else if (methodId === 'sbp') {
      setShowBankApps(true);
    } else if (methodId === 'invoice') {
      setShowInvoiceDialog(true);
    } else {
      processPayment();
    }
  };

  const handleGenerateInvoice = async () => {
    if (!organization) {
      toast({ title: 'Ошибка', description: 'Организация не найдена', variant: 'destructive' });
      return;
    }

    setIsGeneratingInvoice(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          type: 'invoice',
          organizationId: organization.id,
          amount: parseInt(amount),
        },
      });

      if (error) throw error;

      // Download the PDF
      const link = document.createElement('a');
      link.href = data.document.pdf_url;
      link.download = `invoice-${data.document.invoice_number}.pdf`;
      link.click();

      toast({ 
        title: 'Счёт сформирован!',
        description: `Счёт № ${data.document.invoice_number} готов к оплате`,
      });
      
      setShowInvoiceDialog(false);
      navigate('/organization/documents');
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      toast({ 
        title: 'Ошибка формирования счёта', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleBankAppSelect = (bankId: string) => {
    setShowBankApps(false);
    processPayment();
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16 || expiry.length < 5 || cvv.length < 3) {
      toast({ title: 'Заполните все поля карты', variant: 'destructive' });
      return;
    }
    setShowCardForm(false);
    setShowSmsVerification(true);
  };

  const handleSmsVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode.length < 4) {
      toast({ title: 'Введите код из СМС', variant: 'destructive' });
      return;
    }
    setShowSmsVerification(false);
    processPayment();
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({ 
        title: 'Оплата прошла успешно!',
        description: `Подписка ${plan === 'solo' ? 'Solo' : 'Family'} на ${months} мес. активирована`,
      });
      navigate('/profile/premium');
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
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
          <h1 className="text-xl font-bold text-foreground">Оплата</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h2 className="font-semibold mb-3">Ваш заказ</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Подписка Premium {plan === 'solo' ? 'Solo' : 'Family'}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Период</span>
            <span>{months} мес.</span>
          </div>
          <div className="border-t border-border my-3" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Итого</span>
            <span className="font-bold text-lg text-primary">{amount} ₽</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-3 bg-green-500/10 rounded-xl p-3 border border-green-500/20">
          <Shield className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-sm">Безопасная оплата</p>
            <p className="text-xs text-muted-foreground">256-bit SSL шифрование</p>
          </div>
          <Lock className="h-4 w-4 text-green-500 ml-auto" />
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="font-semibold mb-3">Способ оплаты</h2>
          <div className="space-y-2">
            {availablePaymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                } ${method.b2bOnly ? 'ring-2 ring-accent/30' : ''}`}
              >
                <span className="text-2xl">{method.icon}</span>
                <div className="text-left flex-1">
                  <span className="font-medium">{method.name}</span>
                  {method.b2bOnly && (
                    <p className="text-xs text-accent">Для корпоративных клиентов</p>
                  )}
                </div>
                {selectedMethod === method.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Apps */}
        <div>
          <h2 className="font-semibold mb-3">Через приложение банка</h2>
          <div className="grid grid-cols-4 gap-2">
            {bankApps.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleBankAppSelect(bank.id)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
              >
                <div className={`w-10 h-10 rounded-full ${bank.color} flex items-center justify-center text-white text-lg`}>
                  {bank.icon}
                </div>
                <span className="text-xs text-center line-clamp-1">{bank.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <div className="pb-24">
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full"
            onClick={() => {
              if (!selectedMethod) {
                toast({ title: 'Выберите способ оплаты', variant: 'destructive' });
                return;
              }
              processPayment();
            }}
            disabled={!selectedMethod}
          >
            Оплатить {amount} ₽
          </Button>
        </div>
      </div>

      {/* Card Form Dialog */}
      <Dialog open={showCardForm} onOpenChange={setShowCardForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Данные карты</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCardSubmit} className="space-y-4">
            <div>
              <Label>Номер карты</Label>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Срок</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div>
                <Label>CVV</Label>
                <Input
                  type="password"
                  placeholder="***"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="save-card" 
                checked={saveCard} 
                onCheckedChange={(checked) => setSaveCard(!!checked)} 
              />
              <Label htmlFor="save-card" className="text-sm">Сохранить карту для будущих платежей</Label>
            </div>
            <Button type="submit" className="w-full" variant="hero">
              <CreditCard className="h-4 w-4 mr-2" />
              Продолжить
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* SMS Verification Dialog */}
      <Dialog open={showSmsVerification} onOpenChange={setShowSmsVerification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение 3D-Secure</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSmsVerification} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Мы отправили код подтверждения на номер, привязанный к карте ****{cardNumber.slice(-4)}
            </p>
            <div>
              <Label>Код из СМС</Label>
              <Input
                placeholder="Введите код"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" variant="hero">
              <Lock className="h-4 w-4 mr-2" />
              Подтвердить
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => toast({ title: 'Код отправлен повторно' })}>
              Отправить код повторно
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Выставление счёта
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Организация</p>
              <p className="font-semibold">{organization?.name || 'Не указано'}</p>
              <p className="text-sm text-muted-foreground">ИНН: {organization?.inn || 'Не указано'}</p>
            </div>
            
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Сумма счёта</span>
                <span className="text-xl font-bold text-primary">{amount} ₽</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Счёт будет сформирован в формате PDF</p>
              <p>• Срок оплаты: 14 дней</p>
              <p>• Закрывающие документы (УПД) — в конце месяца</p>
            </div>

            <Button 
              onClick={handleGenerateInvoice} 
              className="w-full" 
              variant="hero"
              disabled={isGeneratingInvoice}
            >
              {isGeneratingInvoice ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Формируем счёт...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Сформировать счёт
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold">Обрабатываем платёж...</p>
            <p className="text-sm text-muted-foreground">Не закрывайте страницу</p>
          </div>
        </div>
      )}
    </div>
  );
}
