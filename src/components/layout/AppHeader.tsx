import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeaderAvatar } from '@/components/home/HeaderAvatar';
import { AddressDropdown } from '@/components/home/AddressDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';

// Import HD action icons
import actionHeart from '@/assets/icons/action-heart.png';
import actionLocation from '@/assets/icons/action-location.png';

export function AppHeader() {
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
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 overflow-hidden">
                <img src={actionLocation} alt="Магазины" className="h-6 w-6 object-contain" />
              </Button>
            </Link>
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 overflow-hidden">
                <img src={actionHeart} alt="Избранное" className="h-6 w-6 object-contain" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
