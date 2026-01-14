import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, MapPin, Home, Briefcase, Heart, 
  MoreVertical, Edit2, Trash2, Navigation, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { VigodaMap } from '@/components/map/VigodaMap';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  address: string;
  details?: string;
  isDefault: boolean;
  coordinates: { lat: number; lng: number };
}

const addressIcons = {
  home: Home,
  work: Briefcase,
  other: Heart,
};

const addressLabels = {
  home: 'Дом',
  work: 'Работа',
  other: 'Другое',
};

const initialAddresses: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Дом',
    address: 'ул. Пушкина, д. 10, кв. 25',
    details: 'Подъезд 2, этаж 5, домофон 25',
    isDefault: true,
    coordinates: { lat: 55.7558, lng: 37.6173 },
  },
  {
    id: '2',
    type: 'work',
    label: 'Работа',
    address: 'Бизнес-центр "Москва-Сити", Башня Федерация',
    details: 'Этаж 45, офис 4512',
    isDefault: false,
    coordinates: { lat: 55.7494, lng: 37.5352 },
  },
  {
    id: '3',
    type: 'other',
    label: 'Дача',
    address: 'Московская обл., д. Петрово, ул. Лесная, 15',
    isDefault: false,
    coordinates: { lat: 55.9, lng: 37.4 },
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedType, setSelectedType] = useState<'home' | 'work' | 'other'>('home');
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    details: '',
  });

  const handleAddAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: selectedType,
      label: formData.label || addressLabels[selectedType],
      address: formData.address,
      details: formData.details,
      isDefault: addresses.length === 0,
      coordinates: { lat: 55.7558 + Math.random() * 0.1, lng: 37.6173 + Math.random() * 0.1 },
    };

    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...newAddress, id: editingAddress.id } : a));
      toast({ title: 'Адрес обновлён' });
    } else {
      setAddresses(prev => [...prev, newAddress]);
      toast({ title: 'Адрес добавлен' });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ label: '', address: '', details: '' });
    setSelectedType('home');
    setEditingAddress(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setSelectedType(address.type);
    setFormData({
      label: address.label,
      address: address.address,
      details: address.details || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast({ title: 'Адрес удалён' });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    toast({ title: 'Адрес по умолчанию обновлён' });
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({ title: 'Геолокация определена', description: 'Укажите адрес вручную для точности' });
        },
        () => {
          toast({ title: 'Не удалось определить местоположение', variant: 'destructive' });
        }
      );
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Мои адреса</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Real Map with Addresses */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
          <VigodaMap
            center={addresses[0]?.coordinates || { lat: 55.7558, lng: 37.6173 }}
            zoom={11}
            markers={addresses.map((addr) => ({
              id: addr.id,
              lat: addr.coordinates.lat,
              lng: addr.coordinates.lng,
              color: addr.isDefault ? 'bg-primary' : 'bg-card',
              icon: addr.type === 'home' ? '🏠' : addr.type === 'work' ? '💼' : '📍',
              label: addr.label,
            }))}
            style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
          />
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute bottom-4 right-4"
            onClick={handleDetectLocation}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Моё местоположение
          </Button>
        </div>

        {/* Addresses List */}
        <div className="space-y-3">
          {addresses.map((address) => {
            const Icon = addressIcons[address.type];
            return (
              <div 
                key={address.id}
                className={`bg-card rounded-2xl p-4 border ${address.isDefault ? 'border-primary' : 'border-border'} shadow-sm`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${address.isDefault ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">{address.label}</span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">
                          По умолчанию
                        </span>
                      )}
                    </div>
                    <p className="text-foreground truncate">{address.address}</p>
                    {address.details && (
                      <p className="text-sm text-muted-foreground truncate">{address.details}</p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(address)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      {!address.isDefault && (
                        <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Сделать основным
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(address.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Address Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg" className="w-full">
              <Plus className="h-5 w-5 mr-2" />
              Добавить адрес
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Редактировать адрес' : 'Новый адрес'}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Type Selection */}
              <div>
                <Label className="mb-2 block">Тип адреса</Label>
                <div className="flex gap-2">
                  {(['home', 'work', 'other'] as const).map((type) => {
                    const Icon = addressIcons[type];
                    return (
                      <Button
                        key={type}
                        variant={selectedType === type ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedType(type)}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {addressLabels[type]}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Label */}
              <div>
                <Label htmlFor="label">Название</Label>
                <Input
                  id="label"
                  placeholder={addressLabels[selectedType]}
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Адрес *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Город, улица, дом"
                    className="pl-10"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <Label htmlFor="details">Подробности</Label>
                <Input
                  id="details"
                  placeholder="Подъезд, этаж, домофон..."
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                />
              </div>

              <Button 
                variant="hero" 
                className="w-full" 
                onClick={handleAddAddress}
                disabled={!formData.address.trim()}
              >
                {editingAddress ? 'Сохранить' : 'Добавить адрес'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
