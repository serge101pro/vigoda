import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryChipProps {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  to?: string;
  isActive?: boolean;
  onClick?: () => void;
  color?: string;
}

export function CategoryChip({
  icon: Icon,
  emoji,
  label,
  to,
  isActive = false,
  onClick,
  color = 'bg-primary-light',
}: CategoryChipProps) {
  const content = (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-glow'
          : `${color} hover:shadow-md`
      }`}
      onClick={onClick}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          isActive ? 'bg-primary-foreground/20' : 'bg-background'
        }`}
      >
        {emoji ? (
          <span>{emoji}</span>
        ) : Icon ? (
          <Icon className={`h-6 w-6 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
        ) : null}
      </div>
      <span
        className={`text-xs font-semibold text-center ${
          isActive ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {label}
      </span>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <button className="cursor-pointer">{content}</button>;
}
