import { User, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
  plan?: 'free' | 'solo' | 'family' | 'corp';
  onEditProfile?: () => void;
}

const planLabels = {
  free: 'Выгода',
  solo: 'Персона',
  family: 'Семья',
  corp: 'Бизнес'
};

const planColors = {
  free: 'bg-gray-500 text-white',
  solo: 'bg-green-500 text-white',
  family: 'bg-purple-500 text-white',
  corp: 'bg-orange-500 text-white'
};

export function UserHeader({ name, email, avatarUrl, plan = 'free', onEditProfile }: UserHeaderProps) {
  return (
    <div className="flex flex-col items-center pt-6 pb-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary-foreground">
              {name?.charAt(0).toUpperCase() || 'П'}
            </span>
          )}
        </div>
        {onEditProfile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card shadow-md border border-border"
            onClick={onEditProfile}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <h1 className="mt-3 text-xl font-bold text-foreground">{name}</h1>
      <p className="text-muted-foreground text-sm">{email}</p>
      
      <Badge 
        className={`mt-2 ${planColors[plan]}`}
      >
        {planLabels[plan]}
      </Badge>
    </div>
  );
}
