import { useState } from 'react';
import { Plus, Minus, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore, Product } from '@/stores/useAppStore';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { AddToCartDialog } from '@/components/common/AddToCartDialog';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useAppStore();
  const { isProductFavorite, addProductToFavorites, removeProductFromFavorites } = useFavorites();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Some cart item types (e.g. recipe ingredients) don't have `product`.
  // Guard access to avoid crashes (especially critical on Android WebView).
  const cartItem = cart.find((item) => item.product?.id === product.id);
  const isFavorite = isProductFavorite(product.id);

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await removeProductFromFavorites(product.id);
    } else {
      await addProductToFavorites(product.id);
    }
  };
  
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : 0;

  // Check if product has minimum quantity requirements
  const hasMinQuantity = (product.minQuantity && product.minQuantity > 1) || false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMinQuantity) {
      setDialogOpen(true);
    } else {
      addToCart(product);
    }
  };

  if (variant === 'horizontal') {
    return (
      <>
        <div className="card-product flex gap-4 animate-fade-in">
          <Link to={`/product/${product.id}`} className="relative w-24 h-24 flex-shrink-0">
            <SafeImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
            {product.badge && (
              <span className={cn(
                "absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold rounded",
                product.badge === 'new' && 'bg-primary text-primary-foreground',
                product.badge === 'sale' && 'bg-accent text-accent-foreground',
                product.badge === 'hot' && 'bg-destructive text-destructive-foreground'
              )}>
                {product.badge === 'new' && 'Новинка'}
                {product.badge === 'sale' && 'Акция'}
                {product.badge === 'hot' && 'Хит'}
              </span>
            )}
          </Link>
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">{product.name}</h3>
              </Link>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground">{product.price} ₽</span>
                <span className="text-xs text-muted-foreground">/{product.unit}</span>
                {hasDiscount && (
                  <span className="ml-2 text-xs text-muted-foreground line-through">
                    {product.oldPrice} ₽
                  </span>
                )}
              </div>
              {cartItem ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={(e) => { e.preventDefault(); updateQuantity(product.id, cartItem.quantity - 1); }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center font-semibold">{cartItem.quantity}</span>
                  <Button
                    variant="default"
                    size="icon-sm"
                    onClick={(e) => { e.preventDefault(); updateQuantity(product.id, cartItem.quantity + 1); }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={handleAddToCart}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <AddToCartDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          type="product"
          product={product}
        />
      </>
    );
  }

  return (
    <>
      <div className="card-product relative animate-fade-in">
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
            )}
          />
        </button>

        {/* Badge */}
        {product.badge && (
          <span className={cn(
            "absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-bold rounded-lg",
            product.badge === 'new' && 'bg-primary text-primary-foreground',
            product.badge === 'sale' && 'bg-accent text-accent-foreground',
            product.badge === 'hot' && 'bg-destructive text-destructive-foreground'
          )}>
            {product.badge === 'new' && 'Новинка'}
            {product.badge === 'sale' && `-${discountPercent}%`}
            {product.badge === 'hot' && 'Хит'}
          </span>
        )}

        {/* Image */}
        <Link to={`/product/${product.id}`} className="block aspect-square mb-3 rounded-xl overflow-hidden bg-muted">
          <SafeImage
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
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

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
              onClick={handleAddToCart}
              className="rounded-xl"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type="product"
        product={product}
      />
    </>
  );
}
