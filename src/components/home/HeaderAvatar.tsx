import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { User } from 'lucide-react';

interface HeaderAvatarProps {
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'w-9 h-9',
  md: 'w-10 h-10',
};

const textSizes = {
  sm: 'text-base',
  md: 'text-lg',
};

export function HeaderAvatar({ size = 'md' }: HeaderAvatarProps) {
  const { user } = useAuth();
  const { profile } = useProfile();

  const displayName = profile?.display_name || user?.user_metadata?.display_name || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '';

  return (
    <Link to="/profile" className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {profile?.avatar_url ? (
        <img 
          src={profile.avatar_url} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
      ) : initial ? (
        <span className={`${textSizes[size]} font-bold text-primary-foreground`}>
          {initial}
        </span>
      ) : (
        <User className="h-5 w-5 text-primary-foreground" />
      )}
    </Link>
  );
}
