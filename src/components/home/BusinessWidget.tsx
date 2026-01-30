import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import businessBg from '@/assets/banners/business-bg.jpg';

interface BusinessWidgetProps {
  hasOrganization?: boolean;
  organizationName?: string;
  balance?: number;
}

export function BusinessWidget({ hasOrganization, organizationName, balance }: BusinessWidgetProps) {
  if (hasOrganization) {
    // User is part of organization - show quick access
    return (
      <Link to="/organization">
        <div className="relative overflow-hidden rounded-2xl h-[140px]">
          <SafeImage 
            src={businessBg} 
            alt="Business" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-blue-700/80" />
          
          <div className="relative z-10 h-full p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">{organizationName}</span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-80" />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <p className="text-xs opacity-80">Баланс</p>
                <p className="font-bold text-sm">{(balance || 0).toLocaleString()} ₽</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <Users className="h-4 w-4 mx-auto mb-1" />
                <p className="text-xs">Команда</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <FileText className="h-4 w-4 mx-auto mb-1" />
                <p className="text-xs">Документы</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // User is not part of organization - show promotional widget
  return (
    <div className="relative overflow-hidden rounded-2xl h-[140px]">
      <SafeImage 
        src={businessBg} 
        alt="Business" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-transparent" />
      
      <div className="relative z-10 h-full flex items-center p-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Для бизнеса</h3>
              <p className="text-sm text-white/80">Один счёт, 2% кэшбэк</p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Link to="/business">
              <Button size="sm" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                Подробнее
              </Button>
            </Link>
            <Link to="/organization">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Демо-доступ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
