import { useState } from 'react';
import { ArrowLeft, Copy, Share2, Users, Wallet, Gift, ChevronRight, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/useAppStore';
import { toast } from '@/hooks/use-toast';

export default function AffiliatePage() {
  const { user } = useAppStore();
  const referralCode = user?.referralCode || 'VIGODNO123';
  const referralLink = `https://vigodnotut.app/ref/${referralCode}`;

  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано!',
      description: 'Ссылка скопирована в буфер обмена',
    });
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ВыгодноТут - Экономь до 30%!',
          text: 'Присоединяйся и экономь на покупках!',
          url: referralLink,
        });
      } catch (error) {
        copyToClipboard(referralLink);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const stats = [
    { label: 'Приглашено', value: '5', icon: Users },
    { label: 'Активных', value: '3', icon: Gift },
    { label: 'Заработано', value: '450 ₽', icon: Wallet },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Партнёрская программа</h1>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-6">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-primary-foreground mb-6">
          <Gift className="h-10 w-10 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Приглашай друзей</h2>
          <p className="text-primary-foreground/80 mb-4">
            Получай пожизненный процент от подписок приглашённых пользователей + бонусы за первые действия
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary-foreground/20 rounded-full text-sm font-semibold">
              10% от подписок
            </span>
            <span className="px-3 py-1 bg-primary-foreground/20 rounded-full text-sm font-semibold">
              100 ₽ за заказ
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-muted rounded-2xl p-4 text-center">
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Referral Link */}
      <section className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-3">Ваша реферальная ссылка</h3>
        <div className="bg-muted rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <code className="text-sm text-foreground truncate flex-1 mr-3">
              {referralLink}
            </code>
            <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard(referralLink)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ваш код:</p>
              <p className="font-bold text-foreground">{referralCode}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard(referralCode)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="px-4 mb-6 space-y-3">
        <Button variant="hero" size="lg" className="w-full" onClick={shareLink}>
          <Share2 className="h-5 w-5 mr-2" />
          Поделиться ссылкой
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setShowQR(!showQR)}
        >
          <QrCode className="h-5 w-5 mr-2" />
          Показать QR-код
        </Button>

        {showQR && (
          <div className="bg-muted rounded-2xl p-6 flex items-center justify-center animate-fade-in">
            <div className="w-48 h-48 bg-background rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground text-center text-sm">
                QR-код для<br />{referralCode}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Wallet */}
      <section className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-3">Кошелёк бонусов</h3>
        <Link to="/profile/affiliate/wallet">
          <div className="bg-accent-light rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Wallet className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">450 ₽</p>
                <p className="text-sm text-muted-foreground">Доступно к выводу</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>
      </section>

      {/* Conditions */}
      <section className="px-4 pb-8">
        <h3 className="font-bold text-foreground mb-3">Условия программы</h3>
        <div className="bg-muted rounded-2xl p-4 space-y-3 text-sm text-muted-foreground">
          <p>• 10% от всех подписок приглашённых — пожизненно</p>
          <p>• 100 ₽ за первый заказ приглашённого</p>
          <p>• 50 ₽ за первую подписку приглашённого</p>
          <p>• Минимальная сумма вывода: 500 ₽</p>
          <p>• Выплаты каждую неделю</p>
        </div>
      </section>
    </div>
  );
}
