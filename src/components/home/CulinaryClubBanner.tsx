import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import culinaryClubBg from '@/assets/banners/culinary-club-bg.jpg';

export function CulinaryClubBanner() {
  return (
    <Link to="/social-recipes" className="block">
      <div className="relative overflow-hidden rounded-2xl h-[140px]">
        {/* Background Image */}
        <img 
          src={culinaryClubBg} 
          alt="Culinary Club" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 via-orange-500/80 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center p-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👨‍🍳</span>
              <div>
                <h3 className="text-xl font-bold text-white">Клуб Кулинаров</h3>
                <p className="text-white/90 text-sm">Челленджи, рейтинги, призы</p>
              </div>
            </div>
            <Button size="sm" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 mt-2">
              Присоединиться
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
