import { ChevronRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  to?: string;
  onClick?: () => void;
  badge?: string;
  iconClassName?: string;
}

export function ProfileMenuItem({ 
  icon: Icon, 
  label, 
  to, 
  onClick,
  badge,
  iconClassName = 'text-primary'
}: ProfileMenuItemProps) {
  const content = (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>
        <span className="font-semibold text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}
