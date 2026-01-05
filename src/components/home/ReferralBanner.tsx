import { useState } from 'react';
import { Gift, Share2, Copy, Link2, Check, ExternalLink } from 'lucide-react';
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

export function ReferralBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shortened, setShortened] = useState(false);
  const { user } = useAuth();

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'DEMO1234';
  const baseUrl = window.location.origin;
  const fullReferralLink = `${baseUrl}/register?ref=${referralCode}`;
  const shortReferralLink = `${baseUrl}/r/${referralCode}`;
  
  const displayLink = shortened ? shortReferralLink : fullReferralLink;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayLink);
      setCopied(true);
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
          url: displayLink,
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
        <DialogContent className="sm:max-w-md">
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
            {/* Program description */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Как это работает?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Поделитесь своей уникальной ссылкой с друзьями
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Друг регистрируется и получает <span className="text-primary font-semibold">500 бонусов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Вы получаете <span className="text-primary font-semibold">10%</span> от каждой его покупки
                </li>
              </ul>
            </div>

            {/* Referral link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ваша ссылка:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono truncate border border-border">
                  {displayLink}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShortened(!shortened)}
                  className="flex-1"
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  {shortened ? 'Полная' : 'Сократить'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? 'Скопировано!' : 'Копировать'}
                </Button>
              </div>
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
