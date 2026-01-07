import { useState } from 'react';
import { Gift, Share2, Copy, Check, ExternalLink, Users, Trophy, Sparkles, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export function ReferralBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuth();

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'DEMO1234';
  const shortLink = `vigoda.app/r/${referralCode}`;
  const fullLink = `https://${shortLink}`;

  // Mock statistics
  const stats = { invited: 12, active: 8, earned: 2450 };
  const bestPartner = { invited: 156, earned: 34200 };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      triggerConfetti();
      toast.success('Ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Приглашение в Vigoda',
          text: 'Присоединяйся к Vigoda и получи бонусы! 🎁',
          url: fullLink,
        });
        toast.success('Ссылка отправлена!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white py-2.5 px-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Gift className="h-4 w-4 animate-bounce" />
        <span className="font-semibold text-sm">Приглашай друзей — получай бонусы!</span>
        <Gift className="h-4 w-4 animate-bounce" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm p-4 animate-scale-in">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <Gift className="h-4 w-4 text-white" />
              </div>
              Партнёрская программа
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Motivation banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3 text-white text-center">
              <p className="text-sm font-medium">🎁 Получай <span className="font-bold">10%</span> от покупок друзей!</p>
            </div>

            {/* Stats grid - compact */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-primary/10 rounded-lg p-2 text-center">
                <Users className="h-4 w-4 mx-auto text-primary" />
                <div className="text-base font-bold">{stats.invited}</div>
                <div className="text-[10px] text-muted-foreground">Приглашено</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                <Sparkles className="h-4 w-4 mx-auto text-emerald-500" />
                <div className="text-base font-bold">{stats.active}</div>
                <div className="text-[10px] text-muted-foreground">Активных</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-2 text-center">
                <Trophy className="h-4 w-4 mx-auto text-amber-500" />
                <div className="text-base font-bold text-amber-600">{stats.earned.toLocaleString()}₽</div>
                <div className="text-[10px] text-muted-foreground">Заработано</div>
              </div>
            </div>

            {/* Best Partner - compact */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-2.5 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold">Лучший партнёр</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">{bestPartner.invited} друзей • </span>
                  <span className="font-bold text-amber-600">{bestPartner.earned.toLocaleString()}₽</span>
                </div>
              </div>
            </div>

            {/* Link + Copy */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
              <code className="flex-1 text-xs font-mono truncate">{shortLink}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* QR Toggle */}
            {showQR ? (
              <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl animate-fade-in">
                <QRCodeSVG value={fullLink} size={120} level="H" />
                <button onClick={() => setShowQR(false)} className="text-xs text-muted-foreground hover:underline">
                  Скрыть QR
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowQR(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1"
              >
                <QrCode className="h-3.5 w-3.5" />
                Показать QR-код
              </button>
            )}

            {/* Share button */}
            <Button 
              onClick={shareLink} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться
            </Button>

            {/* Link to full page */}
            <Link 
              to="/profile/affiliate" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
            >
              Подробнее о программе
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
