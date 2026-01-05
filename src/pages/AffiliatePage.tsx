import { useState } from 'react';
import { ArrowLeft, Copy, Share2, Users, Wallet, Gift, ChevronRight, Trophy, Medal, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useReferralStats, useTopReferrers } from '@/hooks/useReferrals';

export default function AffiliatePage() {
  const { user } = useAuth();
  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'VIGODNO123';
  const shortLink = `vigoda.app/r/${referralCode}`;
  const fullLink = `https://${shortLink}`;

  const [showQR, setShowQR] = useState(false);

  const { data: stats } = useReferralStats();
  const { data: leaderboard } = useTopReferrers(10);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerConfetti();
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
          url: fullLink,
        });
      } catch (error) {
        copyToClipboard(fullLink);
      }
    } else {
      copyToClipboard(fullLink);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-amber-500" />;
      case 2: return <Medal className="h-5 w-5 text-slate-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-700" />;
      default: return <span className="w-5 text-center text-sm font-medium text-muted-foreground">{position}</span>;
    }
  };

  const statItems = [
    { label: 'Приглашено', value: stats?.total_invited || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Активных', value: stats?.active_referrals || 0, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Заработано', value: `${(stats?.total_earned || 0).toLocaleString()} ₽`, icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Партнёрская программа</h1>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-6">
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-5 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-white/20">
              <Gift className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Приглашай друзей</h2>
          </div>
          <p className="text-white/90 text-sm mb-4">
            Получай пожизненный процент от подписок + бонусы за первые действия
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold">
              10% от подписок
            </span>
            <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold">
              100 ₽ за заказ
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {statItems.map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 text-center`}>
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        {stats?.user_position && stats.user_position > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Ваша позиция в рейтинге: <span className="font-bold text-primary">#{stats.user_position}</span>
          </p>
        )}
      </section>

      {/* Referral Link */}
      <section className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-2 text-sm">Ваша ссылка</h3>
        <div className="bg-muted rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <code className="flex-1 text-sm font-mono truncate">{shortLink}</code>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(fullLink)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Код: <span className="font-bold text-foreground">{referralCode}</span></span>
            <button onClick={() => setShowQR(!showQR)} className="text-primary hover:underline">
              {showQR ? 'Скрыть QR' : 'QR-код'}
            </button>
          </div>
        </div>

        {showQR && (
          <div className="mt-3 bg-white rounded-2xl p-4 flex justify-center animate-fade-in">
            <QRCodeSVG value={fullLink} size={140} level="H" />
          </div>
        )}
      </section>

      {/* Share Button */}
      <section className="px-4 mb-6">
        <Button 
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" 
          size="lg"
          onClick={shareLink}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Поделиться ссылкой
        </Button>
      </section>

      {/* Leaderboard */}
      <section className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Лидерборд партнёров
        </h3>
        <div className="bg-muted rounded-2xl overflow-hidden">
          {leaderboard?.map((partner, index) => (
            <div 
              key={partner.rank_position}
              className={`flex items-center gap-3 p-3 ${
                partner.is_current_user 
                  ? 'bg-primary/10 border-l-4 border-primary' 
                  : index < leaderboard.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(partner.rank_position)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${partner.is_current_user ? 'text-primary' : 'text-foreground'}`}>
                  {partner.referrer_hash}
                </p>
                <p className="text-xs text-muted-foreground">{partner.total_referrals} друзей</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${partner.rank_position <= 3 ? 'text-amber-500' : 'text-foreground'}`}>
                  {partner.total_earned.toLocaleString()} ₽
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wallet */}
      <section className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-3 text-sm">Кошелёк бонусов</h3>
        <Link to="/profile/affiliate/wallet">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-4 flex items-center justify-between border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-foreground">{(stats?.total_earned || 0).toLocaleString()} ₽</p>
                <p className="text-xs text-muted-foreground">Доступно к выводу</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>
      </section>

      {/* Conditions */}
      <section className="px-4 pb-8">
        <h3 className="font-bold text-foreground mb-3 text-sm">Условия программы</h3>
        <div className="bg-muted rounded-2xl p-4 space-y-2 text-xs text-muted-foreground">
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
