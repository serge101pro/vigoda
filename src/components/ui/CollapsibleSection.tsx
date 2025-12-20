import { useState, useRef, useEffect, ReactNode } from 'react';
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
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        const scrollHeight = contentRef.current.scrollHeight;
        setHeight(scrollHeight);
        // After transition, set to auto for dynamic content
        const timer = setTimeout(() => setHeight('auto'), 300);
        return () => clearTimeout(timer);
      } else {
        // First set current height, then animate to 0
        const scrollHeight = contentRef.current.scrollHeight;
        setHeight(scrollHeight);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }
  }, [isExpanded]);

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
            className="h-8 w-8 p-0 transition-transform duration-300"
          >
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
            />
          </Button>
        </div>
      </div>

      <div
        ref={contentRef}
        style={{ height: height === 'auto' ? 'auto' : `${height}px` }}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
