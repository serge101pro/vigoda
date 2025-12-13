import { useState } from 'react';
import { ArrowLeft, Plus, CreditCard, QrCode, Barcode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoyaltyCard {
  id: string;
  store: string;
  cardNumber: string;
  color: string;
  logo: string;
  balance?: number;
}

const storeOptions = [
  { value: 'pyaterochka', label: 'Пятёрочка', color: 'from-red-500 to-red-600', logo: '🏪' },
  { value: 'magnit', label: 'Магнит', color: 'from-red-600 to-red-700', logo: '🛒' },
  { value: 'perekrestok', label: 'Перекрёсток', color: 'from-green-500 to-green-600', logo: '🛍️' },
  { value: 'vkusvill', label: 'ВкусВилл', color: 'from-green-600 to-teal-600', logo: '🥬' },
  { value: 'lenta', label: 'Лента', color: 'from-blue-500 to-blue-600', logo: '🏬' },
  { value: 'auchan', label: 'Ашан', color: 'from-red-500 to-orange-500', logo: '🦅' },
];

const mockCards: LoyaltyCard[] = [
  { id: '1', store: 'Пятёрочка', cardNumber: '**** **** 4521', color: 'from-red-500 to-red-600', logo: '🏪', balance: 342 },
  { id: '2', store: 'Магнит', cardNumber: '**** **** 8734', color: 'from-red-600 to-red-700', logo: '🛒', balance: 156 },
  { id: '3', store: 'ВкусВилл', cardNumber: '**** **** 2156', color: 'from-green-600 to-teal-600', logo: '🥬', balance: 890 },
];

export default function LoyaltyCardsPage() {
  const [cards, setCards] = useState<LoyaltyCard[]>(mockCards);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCardStore, setNewCardStore] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [selectedCard, setSelectedCard] = useState<LoyaltyCard | null>(null);

  const handleAddCard = () => {
    const storeInfo = storeOptions.find(s => s.value === newCardStore);
    if (storeInfo && newCardNumber) {
      const newCard: LoyaltyCard = {
        id: Date.now().toString(),
        store: storeInfo.label,
        cardNumber: `**** **** ${newCardNumber.slice(-4)}`,
        color: storeInfo.color,
        logo: storeInfo.logo,
        balance: 0
      };
      setCards([...cards, newCard]);
      setAddDialogOpen(false);
      setNewCardStore('');
      setNewCardNumber('');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Карты лояльности</h1>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить карту</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Магазин</Label>
                    <Select value={newCardStore} onValueChange={setNewCardStore}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Выберите магазин" />
                      </SelectTrigger>
                      <SelectContent>
                        {storeOptions.map(store => (
                          <SelectItem key={store.value} value={store.value}>
                            <span className="flex items-center gap-2">
                              {store.logo} {store.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Номер карты</Label>
                    <Input 
                      value={newCardNumber}
                      onChange={e => setNewCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => {}}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Сканировать QR
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {}}>
                      <Barcode className="h-4 w-4 mr-2" />
                      Сканировать штрих-код
                    </Button>
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleAddCard}>
                    Добавить карту
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Нет карт лояльности</h2>
            <p className="text-muted-foreground mb-4">Добавьте карты магазинов для быстрого доступа</p>
            <Button variant="hero" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить карту
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="w-full text-left"
              >
                <div className={`bg-gradient-to-r ${card.color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow`}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl">{card.logo}</span>
                    <span className="font-bold text-lg">{card.store}</span>
                  </div>
                  <p className="text-xl font-mono tracking-wider mb-2">{card.cardNumber}</p>
                  {card.balance !== undefined && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                      <span className="text-sm opacity-80">Баланс бонусов</span>
                      <span className="font-bold text-xl">{card.balance} ₽</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-sm">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedCard.logo} {selectedCard.store}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className={`bg-gradient-to-r ${selectedCard.color} rounded-2xl p-6 text-white mb-4`}>
                  <div className="flex justify-center mb-4">
                    <div className="w-48 h-24 bg-white/20 rounded-lg flex items-center justify-center">
                      <Barcode className="h-16 w-full text-white" />
                    </div>
                  </div>
                  <p className="text-center text-xl font-mono tracking-widest">{selectedCard.cardNumber}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Покажите штрих-код на кассе</p>
                  {selectedCard.balance !== undefined && (
                    <p className="mt-2 text-lg font-bold text-primary">
                      Баланс: {selectedCard.balance} бонусов
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
