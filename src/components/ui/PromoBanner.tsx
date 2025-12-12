import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  variant?: 'primary' | 'accent';
}

export function PromoBanner({
  title,
  subtitle,
  buttonText,
  buttonLink,
  image,
  variant = 'primary',
}: PromoBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 ${
        variant === 'primary' ? 'bg-primary' : 'bg-accent'
      }`}
    >
      <div className="relative z-10 max-w-[60%]">
        <p className={`text-sm font-medium mb-1 ${
          variant === 'primary' ? 'text-primary-foreground/80' : 'text-accent-foreground/80'
        }`}>
          {subtitle}
        </p>
        <h3 className={`text-xl font-bold mb-4 ${
          variant === 'primary' ? 'text-primary-foreground' : 'text-accent-foreground'
        }`}>
          {title}
        </h3>
        <Link to={buttonLink}>
          <Button
            variant={variant === 'primary' ? 'secondary' : 'default'}
            size="sm"
            className={variant === 'primary' ? 'bg-background text-foreground hover:bg-background/90' : ''}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-[45%]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${
          variant === 'primary' ? 'from-primary' : 'from-accent'
        } to-transparent`} />
      </div>
    </div>
  );
}
