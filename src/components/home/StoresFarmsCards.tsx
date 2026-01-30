import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import storesBg from '@/assets/banners/stores-bg.jpg';
import farmsBg from '@/assets/banners/farms-bg.jpg';

export function StoresFarmsCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link to="/stores" className="block">
        <div className="relative overflow-hidden rounded-2xl h-[72px]">
          <SafeImage 
            src={storesBg} 
            alt="Stores" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-500/70" />
          
          <div className="relative z-10 h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <div>
                <h3 className="font-bold text-white text-sm">Магазины</h3>
                <p className="text-xs text-white/80">Сетевые и локальные</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </div>
        </div>
      </Link>
      
      <Link to="/farms" className="block">
        <div className="relative overflow-hidden rounded-2xl h-[72px]">
          <SafeImage 
            src={farmsBg} 
            alt="Farms" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-500/70" />
          
          <div className="relative z-10 h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <div>
                <h3 className="font-bold text-white text-sm">Фермы</h3>
                <p className="text-xs text-white/80">Свежее от фермеров</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </div>
        </div>
      </Link>
    </div>
  );
}
