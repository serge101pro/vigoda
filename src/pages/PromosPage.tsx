import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Star, Percent, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockData';

const promoProducts = mockProducts.filter(p => p.badge === 'sale' || p.badge === 'hot');

const promoCategories = [
  { id: 'all', label: 'Все', emoji: '🔥' },
  { id: 'sale', label: 'Скидки', emoji: '💰' },
  { id: 'hot', label: 'Хиты', emoji: '⭐' },
  { id: 'new', label: 'Новинки', emoji: '🆕' },
];

export default function PromosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = promoProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.badge === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Акции</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Найти акцию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {promoCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.emoji} {cat.label}
            </Button>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-accent to-orange-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Percent className="h-10 w-10" />
            <div>
              <h2 className="font-bold text-lg">Скидки до 50%</h2>
              <p className="text-white/80 text-sm">Успей купить по выгодной цене!</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-accent/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-accent-foreground">{promoProducts.length}</p>
            <p className="text-xs text-muted-foreground">Акций</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">50%</p>
            <p className="text-xs text-muted-foreground">Макс. скидка</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center flex flex-col items-center justify-center">
            <Clock className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">До конца недели</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const discount = product.oldPrice 
              ? Math.round((1 - product.price / product.oldPrice) * 100) 
              : 0;

            return (
              <Link
                key={product.id}
                to={`/promo/${product.id}`}
                className="bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors overflow-hidden"
              >
                <div className="relative aspect-square">
                  <SafeImage 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                      -{discount}%
                    </Badge>
                  )}
                  {product.badge === 'hot' && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      🔥 Хит
                    </Badge>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{product.price} ₽</span>
                    {product.oldPrice && (
                      <span className="text-xs text-muted-foreground line-through">{product.oldPrice} ₽</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Акции не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
