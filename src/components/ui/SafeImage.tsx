import React, { useState, useMemo } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { getSafeUrl } from '@/lib/proxy-url';
import { cn } from '@/lib/utils'; // Стандартная утилита Shadcn для классов

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  showLoader?: boolean;
}

export const SafeImage = ({ 
  src, 
  alt, 
  className, 
  showLoader = true,
  ...props 
}: SafeImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Вычисляем проксированную ссылку один раз при изменении src
  const safeSrc = useMemo(() => getSafeUrl(src), [src]);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {/* Плейсхолдер при загрузке */}
      {isLoading && showLoader && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
        </div>
      )}

      {/* Состояние ошибки */}
      {isError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
          <ImageOff className="w-6 h-6 mb-1 opacity-20" />
          <span className="text-[10px] uppercase font-bold opacity-30">Ошибка сети</span>
        </div>
      ) : (
        <img
          {...props}
          src={safeSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          loading="lazy" // Встроенный Lazy Loading
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setIsError(true);
          }}
        />
      )}
    </div>
  );
};
