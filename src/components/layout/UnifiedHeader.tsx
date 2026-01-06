import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderAvatar } from '@/components/home/HeaderAvatar';
import { AddressDropdown } from '@/components/home/AddressDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';

export function UnifiedHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderAvatar />
            <AddressDropdown />
          </div>
          <div className="flex items-center gap-1">
            <Link to="/nearest-stores">
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <MapPin className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
