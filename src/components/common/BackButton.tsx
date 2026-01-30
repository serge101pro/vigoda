import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'icon' | 'icon-sm' | 'default';
}

/**
 * BackButton uses browser history navigation (go back to previous page)
 * Falls back to specified path if no history is available
 */
export function BackButton({ 
  fallbackPath = '/', 
  className = '',
  variant = 'ghost',
  size = 'icon'
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleBack}
      className={className}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
