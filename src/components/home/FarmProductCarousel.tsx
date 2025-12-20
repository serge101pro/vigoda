import { Link } from 'react-router-dom';
import { Star, Plus, Minus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FarmProduct } from '@/data/farmData';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface FarmProductCarouselProps {
  products: FarmProduct[];
  rows?: number;
}

function FarmProductCard({ product }: { product: FarmProduct }) {
  const { cart, addToCart, updateQuantity } = useAppStore();

  // Convert to cart-compatible format
  const cartProduct = {
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    price: product.price,
    oldPrice: product.oldPrice,
    unit: product.unit,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.oldPrice ? 'sale' as const : 'new' as const,
  };

  const cartItem = cart.find((item) => item.product.id === product.id);
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0;

  return (
    <div className="card-product relative animate-fade-in">
      {/* Badge */}
      {hasDiscount ? (
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-bold rounded-lg bg-accent text-accent-foreground">
          -{discountPercent}%
        </span>
      ) : (
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground">
          🌿 Эко
        </span>
      )}

      {/* Image */}
      <Link to={`/farm-product/${product.id}`} className="block aspect-square mb-3 rounded-xl overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-1">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-medium text-foreground">{product.rating}</span>
        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
      </div>

      {/* Name */}
      <Link to={`/farm-product/${product.id}`}>
        <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
          {product.name}
        </h3>
      </Link>

      {/* Farm badge */}
      <p className="text-xs text-muted-foreground mb-2 truncate">
        {product.farm.name}
      </p>

      {/* Price and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">{product.price} ₽</span>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {product.oldPrice} ₽
            </span>
          )}
        </div>

        {cartItem ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center font-semibold text-sm">{cartItem.quantity}</span>
            <Button
              variant="default"
              size="icon-sm"
              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={() => addToCart(cartProduct)}
            className="rounded-xl"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function FarmProductCarousel({ products, rows = 1 }: FarmProductCarouselProps) {
  const itemsPerRow = Math.ceil(products.length / rows);
  const productRows = Array.from({ length: rows }, (_, i) =>
    products.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  return (
    <div className="space-y-3">
      {productRows.map((rowProducts, rowIndex) => (
        <div key={rowIndex} className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {rowProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-44">
              <FarmProductCard product={product} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
