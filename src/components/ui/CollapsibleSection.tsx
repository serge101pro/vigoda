import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CollapsibleSectionProps {
  title: string;
  linkText?: string;
  linkTo?: string;
  children: ReactNode;
  initialExpanded?: boolean;
}

export function CollapsibleSection({ 
  title, 
  linkText, 
  linkTo, 
  children, 
  initialExpanded = true 
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {linkText && linkTo && (
            <Link to={linkTo} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
              {linkText}
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
