import { useState } from 'react';
import { Gift, Share2, Copy, Check, ExternalLink, Users, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/r/${referralCode}`;

  // Mock statistics - в реальном приложении данные из Supabase
  const stats = {
    invited: 12,
    active: 8,
    earned: 2450,
  };

  const bestPartner = {
    invited: 156,
    earned: 34200,
  };

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
      await navigator.clipboard.writeText(referralLink);
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
          url: referralLink,
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
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Gift className="h-6 w-6 text-primary" />
              Партнёрская программа
            </DialogTitle>
            <DialogDescription className="text-left">
              Приглашайте друзей и зарабатывайте вместе!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-primary/10 rounded-xl p-3 text-center">
                <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-lg font-bold text-foreground">{stats.invited}</div>
                <div className="text-xs text-muted-foreground">Приглашено</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-3 text-center">
                <Sparkles className="h-5 w-5 mx-auto text-green-500 mb-1" />
                <div className="text-lg font-bold text-foreground">{stats.active}</div>
                <div className="text-xs text-muted-foreground">Активных</div>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-3 text-center">
                <Trophy className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                <div className="text-lg font-bold text-foreground">{stats.earned.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Бонусов</div>
              </div>
            </div>

            {/* Best Partner */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-3 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-foreground">Лучший партнёр месяца</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Приглашено: <span className="font-bold text-foreground">{bestPartner.invited}</span></span>
                <span className="text-muted-foreground">Заработано: <span className="font-bold text-amber-500">{bestPartner.earned.toLocaleString()} ₽</span></span>
              </div>
            </div>

            {/* Referral link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ваша ссылка:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono truncate border border-border">
                  {referralLink}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="w-full"
              >
                {showQR ? 'Скрыть QR-код' : 'Показать QR-код'}
              </Button>
              {showQR && (
                <div className="flex justify-center p-4 bg-white rounded-xl animate-fade-in">
                  <QRCodeSVG 
                    value={referralLink} 
                    size={160}
                    level="H"
                    includeMargin
                  />
                </div>
              )}
            </div>

            {/* Share button */}
            <Button 
              onClick={shareLink} 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться ссылкой
            </Button>

            {/* Link to full page */}
            <Link 
              to="/profile/affiliate" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
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
