import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Users, FileText, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">{organizationName}</span>
            </div>
            <ChevronRight className="h-5 w-5 opacity-80" />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/20 rounded-xl p-2 text-center">
              <p className="text-xs opacity-80">Баланс</p>
              <p className="font-bold text-sm">{(balance || 0).toLocaleString()} ₽</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2 text-center">
              <Users className="h-4 w-4 mx-auto mb-1" />
              <p className="text-xs">Команда</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2 text-center">
              <FileText className="h-4 w-4 mx-auto mb-1" />
              <p className="text-xs">Документы</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // User is not part of organization - show promotional widget
  return (
    <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-300 dark:to-slate-400 rounded-2xl p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-slate-400/30 rounded-xl">
          <Building2 className="h-6 w-6 text-slate-800" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900">Для бизнеса</h3>
          <p className="text-sm text-slate-700">
            Кормите команду вкусно и без лишних бумаг
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center">
            <span className="text-green-700">✓</span>
          </div>
          <span className="text-slate-800">Один счёт в конце месяца</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center">
            <span className="text-green-700">✓</span>
          </div>
          <span className="text-slate-800">Закрывающие документы в ЭДО</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center">
            <span className="text-green-700">✓</span>
          </div>
          <span className="text-slate-800">2% кэшбэк на корпоративный баланс</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to="/business" className="flex-1">
          <Button size="sm" className="w-full bg-slate-800 text-white hover:bg-slate-900">
            Подробнее
          </Button>
        </Link>
        <Link to="/organization" className="flex-1">
          <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Демо-доступ
          </Button>
        </Link>
      </div>
    </div>
  );
}
