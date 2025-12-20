import { Link } from 'react-router-dom';
import { Heart, Plus, Minus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useAppStore, Product } from '@/stores/useAppStore';
import { useFavorites } from '@/hooks/useFavorites';

interface PetProductCarouselProps {
  products: Product[];
  rows?: number;
}

export function PetProductCarousel({ products, rows = 1 }: PetProductCarouselProps) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useAppStore();
  const { isProductFavorite, addProductToFavorites, removeProductFromFavorites } = useFavorites();

  const getCartItem = (productId: string) => 
    cart.find((item) => item.type === 'product' && item.product?.id === productId);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleToggleFavorite = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProductFavorite(product.id)) {
      await removeProductFromFavorites(product.id);
    } else {
      await addProductToFavorites(product.id);
    }
  };

  const itemsPerRow = Math.ceil(products.length / rows);
  const productRows = Array.from({ length: rows }, (_, i) =>
    products.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  return (
    <div className="space-y-3">
      {productRows.map((rowProducts, rowIndex) => (
        <Carousel key={rowIndex} opts={{ align: 'start', dragFree: true }} className="w-full">
          <CarouselContent className="-ml-2 px-4">
            {rowProducts.map((product) => {
              const cartItem = getCartItem(product.id);
              const quantity = cartItem?.quantity || 0;
              const favorite = isProductFavorite(product.id);

              return (
                <CarouselItem key={product.id} className="pl-2 basis-[140px]">
                  <Link to={`/product/${product.id}`}>
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                      <div className="relative aspect-square bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => handleToggleFavorite(product, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm"
                        >
                          <Heart
                            className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                          />
                        </button>
                        {product.badge && (
                          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.badge === 'sale' ? 'bg-red-500 text-white' :
                            product.badge === 'new' ? 'bg-green-500 text-white' :
                            'bg-orange-500 text-white'
                          }`}>
                            {product.badge === 'sale' ? 'Скидка' :
                             product.badge === 'new' ? 'Новинка' : 'Хит'}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-sm font-bold text-foreground">
                            {product.price} ₽
                          </span>
                          {product.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {product.oldPrice} ₽
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          {quantity > 0 ? (
                            <div className="flex items-center justify-between bg-primary/10 rounded-xl p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg"
                                onClick={(e) => handleUpdateQuantity(product.id, quantity - 1, e)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium">{quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg"
                                onClick={(e) => handleUpdateQuantity(product.id, quantity + 1, e)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-7 text-xs rounded-xl"
                              onClick={(e) => handleAddToCart(product, e)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              В корзину
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      ))}
    </div>
  );
}
