import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';

interface CateringOffer {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'home' | 'office' | 'themed';
  priceFrom: number;
  guestsMin: number;
  guestsMax: number;
}

interface CateringCarouselProps {
  offers: CateringOffer[];
  rows?: number;
}

export function CateringCarousel({ offers, rows = 1 }: CateringCarouselProps) {
  const itemsPerRow = Math.ceil(offers.length / rows);
  const offerRows = Array.from({ length: rows }, (_, i) =>
    offers.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  const categoryLabels = {
    home: 'На дом',
    office: 'В офис',
    themed: 'Тематический'
  };

  const categoryColors = {
    home: 'bg-green-500/10 text-green-600',
    office: 'bg-blue-500/10 text-blue-600',
    themed: 'bg-purple-500/10 text-purple-600'
  };

  return (
    <div className="space-y-3">
      {offerRows.map((rowOffers, rowIndex) => (
        <div key={rowIndex} className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {rowOffers.map((offer) => (
            <Link
              key={offer.id}
              to={`/catering?offer=${offer.id}`}
              className="flex-shrink-0 w-64 bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:border-primary/30 transition-colors"
            >
              <div className="relative h-36">
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[offer.category]}`}>
                  {categoryLabels[offer.category]}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">{offer.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{offer.guestsMin}-{offer.guestsMax} гостей</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                    от {offer.priceFrom}₽
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
