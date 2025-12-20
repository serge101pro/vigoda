import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  ShoppingCart, 
  CreditCard,
  Check,
  ChevronRight,
  Utensils,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const features = [
  {
    icon: Users,
    title: 'Управление командой',
    description: 'Добавляйте сотрудников, устанавливайте лимиты и роли (Admin, Manager, Employee)'
  },
  {
    icon: ShoppingCart,
    title: 'Совместная корзина',
    description: 'Сотрудники накидывают товары до 11:00 — в 11:15 заказ улетает одной доставкой'
  },
  {
    icon: CreditCard,
    title: 'Оплата по счёту',
    description: 'Пополняйте баланс компании по счёту. Никаких карт и подписок'
  },
  {
    icon: FileText,
    title: 'Документы автоматически',
    description: 'Счета на оплату и УПД формируются сами — скачивайте и отправляйте в ЭДО'
  },
  {
    icon: BarChart3,
    title: 'Аналитика расходов',
    description: 'Кто сколько тратит, по каким категориям, прогноз бюджета'
  },
  {
    icon: Shield,
    title: 'Контроль лимитов',
    description: 'Устанавливайте месячные лимиты на сотрудника — никаких перерасходов'
  },
];

const useCases = [
  {
    emoji: '🍽️',
    title: 'Обеды в офис',
    description: 'Готовые бизнес-ланчи каждый день',
    color: 'bg-green-500/10 border-green-500/30'
  },
  {
    emoji: '☕',
    title: 'Офисная кухня',
    description: 'Кофе, снеки, вода для команды',
    color: 'bg-blue-500/10 border-blue-500/30'
  },
  {
    emoji: '🎉',
    title: 'Корпоративы',
    description: 'Кейтеринг на мероприятия любого масштаба',
    color: 'bg-amber-500/10 border-amber-500/30'
  },
];

const pricingTiers = [
  { employees: '1-10', price: '0 ₽/мес', note: 'Бесплатно' },
  { employees: '11-50', price: '2 990 ₽/мес', note: '~ 60 ₽ на сотрудника' },
  { employees: '51-200', price: '7 990 ₽/мес', note: '~ 40 ₽ на сотрудника' },
  { employees: '200+', price: 'Индивидуально', note: 'Свяжитесь с нами' },
];

export default function BusinessLandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDemo, setShowDemo] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleDemoRequest = () => {
    if (!companyName || !contactEmail) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    toast({
      title: 'Заявка отправлена!',
      description: 'Мы свяжемся с вами в течение 24 часов'
    });
    setShowDemo(false);
    
    // Demo mode - navigate to organization dashboard
    navigate('/organization');
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
          <h1 className="text-lg font-bold text-foreground">Для бизнеса</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-8">
        {/* Hero */}
        <section className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            Кормите команду<br />без лишних бумаг
          </h1>
          <p className="text-muted-foreground mb-6">
            Один счёт в конце месяца. Все закрывающие документы. Кэшбэк на баланс.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="hero" size="lg" onClick={() => setShowDemo(true)}>
              Попробовать бесплатно
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/organization')}>
              Демо-кабинет
            </Button>
          </div>
        </section>

        {/* Trust badges */}
        <section className="flex justify-center gap-6 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">500+</p>
            <p className="text-xs text-muted-foreground">компаний</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">15 000</p>
            <p className="text-xs text-muted-foreground">сотрудников</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">2%</p>
            <p className="text-xs text-muted-foreground">кэшбэк</p>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-xl font-bold mb-4">Закупки для офиса</h2>
          <div className="space-y-3">
            {useCases.map((useCase, index) => (
              <div key={index} className={`rounded-2xl border p-4 ${useCase.color}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{useCase.emoji}</span>
                  <div>
                    <h3 className="font-semibold">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-xl font-bold mb-4">Возможности</h2>
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/50 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-4">Как это работает</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <h3 className="font-semibold">Подключите компанию</h3>
                <p className="text-sm text-muted-foreground">Заполните данные и добавьте сотрудников</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">2</div>
              <div>
                <h3 className="font-semibold">Пополните баланс</h3>
                <p className="text-sm text-muted-foreground">Выставьте счёт и оплатите по безналу</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">3</div>
              <div>
                <h3 className="font-semibold">Сотрудники заказывают</h3>
                <p className="text-sm text-muted-foreground">Каждый выбирает что хочет в рамках лимита</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">4</div>
              <div>
                <h3 className="font-semibold">Получайте документы</h3>
                <p className="text-sm text-muted-foreground">УПД и акты формируются автоматически</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="text-xl font-bold mb-4">Тарифы</h2>
          <div className="space-y-3">
            {pricingTiers.map((tier, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{tier.employees} сотрудников</p>
                  <p className="text-xs text-muted-foreground">{tier.note}</p>
                </div>
                <p className="font-bold text-primary">{tier.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary rounded-2xl p-6 text-primary-foreground text-center">
          <Zap className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Начните бесплатно</h2>
          <p className="text-sm opacity-90 mb-4">
            До 10 сотрудников — бесплатно навсегда
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full"
            onClick={() => setShowDemo(true)}
          >
            Подключить компанию
          </Button>
        </section>
      </div>

      {/* Demo Request Dialog */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подключить компанию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название компании</Label>
              <Input
                placeholder="ООО «Ваша компания»"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email для связи</Label>
              <Input
                type="email"
                placeholder="hr@company.ru"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleDemoRequest}>
              Отправить заявку
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Нажимая кнопку, вы соглашаетесь с условиями использования
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
