import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/stores/useAppStore';

interface ProductCarouselProps {
  products: Product[];
  rows?: number;
}

export function ProductCarousel({ products, rows = 1 }: ProductCarouselProps) {
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
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
