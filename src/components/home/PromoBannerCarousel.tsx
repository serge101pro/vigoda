import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  bgGradient: string;
  emoji?: string;
}

const promoBanners: Banner[] = [
  {
    id: '1',
    title: 'Бесплатная доставка',
    subtitle: 'При заказе от 1500 ₽',
    buttonText: 'Заказать',
    buttonLink: '/catalog',
    bgGradient: 'from-primary to-primary-dark',
    emoji: '🚚'
  },
  {
    id: '2',
    title: 'Скидка 20%',
    subtitle: 'На первый заказ',
    buttonText: 'Получить',
    buttonLink: '/catalog',
    bgGradient: 'from-accent to-orange-600',
    emoji: '🎁'
  },
  {
    id: '3',
    title: 'Фермерские продукты',
    subtitle: 'Свежее с доставкой за 2 часа',
    buttonText: 'Смотреть',
    buttonLink: '/farm-products',
    bgGradient: 'from-emerald-500 to-green-600',
    emoji: '🥬'
  },
  {
    id: '4',
    title: 'Готовые рационы',
    subtitle: 'Питание на неделю от 999 ₽/день',
    buttonText: 'Выбрать',
    buttonLink: '/ready-meals',
    bgGradient: 'from-violet-500 to-purple-600',
    emoji: '🍱'
  },
  {
    id: '5',
    title: 'Приведи друга',
    subtitle: 'Получи 500 ₽ на счёт',
    buttonText: 'Узнать',
    buttonLink: '/profile/affiliate',
    bgGradient: 'from-amber-500 to-yellow-600',
    emoji: '👥'
  },
];

export function PromoBannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + promoBanners.length) % promoBanners.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const currentBanner = promoBanners[currentIndex];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${currentBanner.bgGradient} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {currentBanner.emoji && <span className="text-2xl">{currentBanner.emoji}</span>}
              <h3 className="text-lg font-bold text-white">{currentBanner.title}</h3>
            </div>
            <p className="text-white/90 text-sm mb-3">{currentBanner.subtitle}</p>
            <Link to={currentBanner.buttonLink}>
              <Button size="sm" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                {currentBanner.buttonText}
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-3">
        {promoBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex 
                ? 'bg-primary w-4' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
