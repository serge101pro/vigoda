import { useState } from 'react';
import { ArrowLeft, Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, Gift, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useReferralStats } from '@/hooks/useReferrals';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  description: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earning',
    amount: 200,
    status: 'completed',
    description: 'Бонус за реферала @user123',
    date: '2024-01-05',
  },
  {
    id: '2',
    type: 'earning',
    amount: 150,
    status: 'completed',
    description: '10% от подписки реферала',
    date: '2024-01-03',
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: -500,
    status: 'pending',
    description: 'Вывод на карту •••• 4242',
    date: '2024-01-02',
  },
  {
    id: '4',
    type: 'bonus',
    amount: 100,
    status: 'completed',
    description: 'Приветственный бонус',
    date: '2024-01-01',
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: -1000,
    status: 'completed',
    description: 'Вывод на карту •••• 4242',
    date: '2023-12-28',
  },
];

export default function WalletPage() {
  const { data: stats } = useReferralStats();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const balance = stats?.total_earned || 0;
  const minWithdrawal = 500;

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < minWithdrawal) {
      toast({ title: `Минимальная сумма вывода ${minWithdrawal} ₽`, variant: 'destructive' });
      return;
    }
    if (amount > balance) {
      toast({ title: 'Недостаточно средств', variant: 'destructive' });
      return;
    }
    if (!cardNumber || cardNumber.length < 16) {
      toast({ title: 'Введите номер карты', variant: 'destructive' });
      return;
    }

    toast({ title: 'Заявка на вывод создана', description: 'Средства поступят в течение 3 рабочих дней' });
    setIsWithdrawOpen(false);
    setWithdrawAmount('');
    setCardNumber('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earning': return <ArrowDownCircle className="h-5 w-5 text-emerald-500" />;
      case 'withdrawal': return <ArrowUpCircle className="h-5 w-5 text-destructive" />;
      case 'bonus': return <Gift className="h-5 w-5 text-amber-500" />;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile/affiliate">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Кошелёк партнёра</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -left-4 -bottom-10 h-28 w-28 rounded-full bg-white/10" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-6 w-6" />
              <span className="text-sm opacity-80">Доступный баланс</span>
            </div>
            <p className="text-4xl font-bold mb-4">{balance.toLocaleString()} ₽</p>
            
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  disabled={balance < minWithdrawal}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Вывести средства
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Вывод средств</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Сумма вывода</Label>
                    <div className="relative mt-1">
                      <Input 
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder={`Мин. ${minWithdrawal} ₽`}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Доступно: {balance.toLocaleString()} ₽
                    </p>
                  </div>
                  
                  <div>
                    <Label>Номер карты</Label>
                    <Input 
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="0000 0000 0000 0000"
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">
                      • Минимальная сумма вывода: {minWithdrawal} ₽<br />
                      • Срок зачисления: до 3 рабочих дней<br />
                      • Комиссия за вывод: 0%
                    </p>
                  </div>

                  <Button onClick={handleWithdraw} className="w-full">
                    Отправить заявку
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Всего заработано</p>
            <p className="text-xl font-bold text-foreground">{(stats?.total_earned || 0).toLocaleString()} ₽</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Ожидает</p>
            <p className="text-xl font-bold text-amber-500">500 ₽</p>
          </div>
        </div>

        {/* Transactions */}
        <section>
          <h3 className="font-bold text-foreground mb-3">История операций</h3>
          <div className="space-y-2">
            {mockTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {getTypeIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getStatusIcon(tx.status)}
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </div>
                <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ₽
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
