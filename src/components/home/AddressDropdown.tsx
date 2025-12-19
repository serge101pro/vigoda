import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock addresses - in real app would come from database
const mockAddresses = [
  { id: '1', name: 'Дом', address: 'ул. Ленина, д. 10, кв. 5' },
  { id: '2', name: 'Офис', address: 'пр. Мира, д. 25, оф. 301' },
  { id: '3', name: 'Дача', address: 'СНТ Солнечный, уч. 42' },
];

interface AddressDropdownProps {
  className?: string;
}

export function AddressDropdown({ className }: AddressDropdownProps) {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [selectedAddress, setSelectedAddress] = useState<typeof mockAddresses[0] | null>(null);

  useEffect(() => {
    // Get last used address from localStorage
    const lastUsedId = localStorage.getItem('lastUsedAddressId');
    if (lastUsedId) {
      const found = addresses.find(a => a.id === lastUsedId);
      if (found) {
        setSelectedAddress(found);
        return;
      }
    }
    // If no last used, set first address or null
    if (addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);

  const handleSelectAddress = (address: typeof mockAddresses[0]) => {
    setSelectedAddress(address);
    localStorage.setItem('lastUsedAddressId', address.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex flex-col items-start text-left ${className}`}>
          <span className="text-xs text-muted-foreground">Доставка в</span>
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate max-w-[120px]">
              {selectedAddress ? selectedAddress.name : 'Укажите адрес'}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover z-50">
        {addresses.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground text-center">
            Нет сохранённых адресов
          </div>
        ) : (
          addresses.map((addr) => (
            <DropdownMenuItem
              key={addr.id}
              onClick={() => handleSelectAddress(addr)}
              className={selectedAddress?.id === addr.id ? 'bg-muted' : ''}
            >
              <div className="flex flex-col">
                <span className="font-medium">{addr.name}</span>
                <span className="text-xs text-muted-foreground truncate">{addr.address}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/addresses" className="flex items-center gap-2 text-primary">
            <Plus className="h-4 w-4" />
            <span>Добавить адрес</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
