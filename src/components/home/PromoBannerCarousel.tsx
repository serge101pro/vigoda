import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// HD Promo images
import deliveryPromo from '@/assets/promo/delivery-promo.jpg';
import firstOrderPromo from '@/assets/promo/first-order-promo.jpg';
import farmPromo from '@/assets/promo/farm-promo.jpg';
import mealKitsPromo from '@/assets/promo/meal-kits-promo.jpg';
import referralPromo from '@/assets/promo/referral-promo.jpg';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

const promoBanners: Banner[] = [
  {
    id: '1',
    title: 'Бесплатная доставка',
    subtitle: 'При заказе от 1500 ₽',
    buttonText: 'Заказать',
    buttonLink: '/catalog',
    image: deliveryPromo,
  },
  {
    id: '2',
    title: 'Скидка 20%',
    subtitle: 'На первый заказ',
    buttonText: 'Получить',
    buttonLink: '/catalog',
    image: firstOrderPromo,
  },
  {
    id: '3',
    title: 'Фермерские продукты',
    subtitle: 'Свежее с доставкой за 2 часа',
    buttonText: 'Смотреть',
    buttonLink: '/farm-products',
    image: farmPromo,
  },
  {
    id: '4',
    title: 'Готовые рационы',
    subtitle: 'Питание на неделю от 999 ₽/день',
    buttonText: 'Выбрать',
    buttonLink: '/ready-meals',
    image: mealKitsPromo,
  },
  {
    id: '5',
    title: 'Приведи друга',
    subtitle: 'Получи 500 ₽ на счёт',
    buttonText: 'Узнать',
    buttonLink: '/profile/affiliate',
    image: referralPromo,
  },
];

export function PromoBannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + promoBanners.length) % promoBanners.length);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
      <div 
        className="relative rounded-2xl overflow-hidden h-40 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image */}
        <img 
          src={currentBanner.image} 
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="relative h-full flex items-center p-5">
          <div className="flex-1 max-w-[60%]">
            <h3 className="text-lg font-bold text-white mb-1">{currentBanner.title}</h3>
            <p className="text-white/90 text-sm mb-3">{currentBanner.subtitle}</p>
            <Link to={currentBanner.buttonLink}>
              <Button size="sm" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">
                {currentBanner.buttonText}
              </Button>
            </Link>
          </div>
        </div>
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
