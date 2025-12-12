import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  linkText?: string;
  linkTo?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, linkText = 'Все', linkTo, action }: SectionHeaderProps) {
  return (
    <div className="section-header px-4">
      <h2 className="section-title">{title}</h2>
      {action ? (
        action
      ) : linkTo ? (
        <Link to={linkTo} className="section-link flex items-center gap-1">
          {linkText}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
