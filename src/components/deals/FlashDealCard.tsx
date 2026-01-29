import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlashDealProps {
  id: string;
  product: {
    name: string;
    image: string;
  };
  originalPrice: number;
  dealPrice: number;
  discount: number;
  remaining: number;
  total: number;
  endsIn: number; // seconds from now
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function FlashDealCard({ 
  product, 
  originalPrice, 
  dealPrice, 
  remaining, 
  total, 
  endsIn: initialEndsIn 
}: FlashDealProps) {
  const [timeLeft, setTimeLeft] = useState(initialEndsIn);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progressPercent = (remaining / total) * 100;
  const isUrgent = timeLeft < 3600; // Less than 1 hour

  return (
    <div 
      className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-[200px] shrink-0 transition-all ${
        isExpired ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{dealPrice}₽</span>
            <span className="text-white/60 line-through text-sm">{originalPrice}₽</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1 ${isUrgent && !isExpired ? 'animate-pulse text-yellow-300' : ''}`}>
          <Clock className="h-3 w-3" />
          <span>{isExpired ? 'Завершено' : formatTime(timeLeft)}</span>
        </div>
        <span className="text-white/80">Осталось: {remaining}/{total}</span>
      </div>
      
      <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            progressPercent < 20 ? 'bg-red-400' : 'bg-white'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {!isExpired && (
        <Button 
          size="sm" 
          className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white border-none"
        >
          В корзину
        </Button>
      )}
    </div>
  );
}
