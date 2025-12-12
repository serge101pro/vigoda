import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/useAppStore';
import { ShoppingBag, BarChart3, ChefHat, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-groceries.jpg';

const slides = [
  {
    icon: ShoppingBag,
    title: 'Сравнивайте цены',
    description: 'Находите лучшие цены на продукты, косметику и бытовую химию в вашем городе',
    color: 'bg-primary-light',
  },
  {
    icon: BarChart3,
    title: 'Экономьте до 30%',
    description: 'Умная корзина автоматически оптимизирует ваш список покупок',
    color: 'bg-accent-light',
  },
  {
    icon: ChefHat,
    title: 'Готовьте вкусно',
    description: 'Рецепты с автоматическим добавлением ингредиентов в список покупок',
    color: 'bg-primary-light',
  },
];

export function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const setHasSeenOnboarding = useAppStore((state) => state.setHasSeenOnboarding);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setHasSeenOnboarding(true);
    navigate('/');
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          Пропустить
        </Button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[45vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />
        <img
          src={heroImage}
          alt="Свежие продукты"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full shadow-lg">
            <ShoppingBag className="h-5 w-5" />
            <span className="font-bold text-lg">ВыгодноТут</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <div className="flex-1">
          {/* Slide Content */}
          <div className="animate-fade-in" key={currentSlide}>
            <div className={`inline-flex p-4 rounded-2xl ${slides[currentSlide].color} mb-6`}>
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className="h-8 w-8 text-primary" />;
              })()}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          variant="hero"
          size="xl"
          onClick={handleNext}
          className="w-full"
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Далее
              <ArrowRight className="h-5 w-5" />
            </>
          ) : (
            'Начать покупки'
          )}
        </Button>
      </div>
    </div>
  );
}
