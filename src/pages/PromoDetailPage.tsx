import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Clock, ShoppingCart, Star, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mockProducts } from '@/data/mockData';

export default function PromoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Find sale products
  const saleProducts = mockProducts.filter(p => p.badge === 'sale' || p.badge === 'hot');
  const promoProduct = saleProducts.find(p => p.id === id) || saleProducts[0];

  if (!promoProduct) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Акция не найдена</p>
          <Link to="/catalog?filter=sale">
            <Button>Смотреть все акции</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent = promoProduct.oldPrice 
    ? Math.round((1 - promoProduct.price / promoProduct.oldPrice) * 100)
    : 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  const handleAddToCart = () => {
    toast({
      title: 'Добавлено в корзину',
      description: promoProduct.name,
    });
  };

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Акция</h1>
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-muted">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Image */}
      <section className="relative">
        <div className="aspect-square bg-muted">
          <img 
            src={promoProduct.image} 
            alt={promoProduct.name}
            className="w-full h-full object-cover"
          />
        </div>
        {discountPercent > 0 && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
            -{discountPercent}%
          </Badge>
        )}
      </section>

      {/* Info */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{promoProduct.rating}</span>
            <span className="text-sm text-muted-foreground">({promoProduct.reviewCount} отзывов)</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">{promoProduct.name}</h2>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="h-4 w-4" />
          <span>Акция действует до 31.12.2024</span>
        </div>

        {/* Price */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Цена по акции</p>
              <p className="text-3xl font-bold text-accent">{promoProduct.price} ₽</p>
              {promoProduct.oldPrice && (
                <p className="text-lg text-muted-foreground line-through">{promoProduct.oldPrice} ₽</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Экономия</p>
              <p className="text-xl font-bold text-primary">
                {promoProduct.oldPrice ? promoProduct.oldPrice - promoProduct.price : 0} ₽
              </p>
            </div>
          </div>
        </div>

        {/* Promo conditions */}
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Условия акции
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Скидка действует при заказе от 1 шт</li>
            <li>• Акция не суммируется с другими предложениями</li>
            <li>• Количество товара ограничено</li>
            <li>• Действует до 31.12.2024</li>
          </ul>
        </div>
      </section>

      {/* Other Sale Products */}
      <section className="px-4 mb-24">
        <h3 className="font-bold text-lg mb-3">Другие акции</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {saleProducts.filter(p => p.id !== promoProduct.id).slice(0, 4).map((product) => (
            <Link 
              key={product.id}
              to={`/promo/${product.id}`}
              className="flex-shrink-0 w-36 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="aspect-square bg-muted relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.oldPrice && (
                  <Badge className="absolute top-2 left-2 bg-destructive text-xs">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{product.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-accent">{product.price} ₽</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <Button 
          className="w-full h-12 rounded-xl text-base"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          В корзину • {promoProduct.price} ₽
        </Button>
      </div>
    </div>
  );
}

