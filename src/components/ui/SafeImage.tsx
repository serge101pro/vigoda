import React, { useState, useMemo } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

// Утилита для формирования пути
const getProxiedUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  // Не проксируем локальные файлы и то, что уже на нашем домене
  if (url.startsWith('/') || url.includes('vigodnotut.ru') || url.startsWith('data:')) {
    return url;
  }
  // Все остальное отправляем через Cloudflare Worker
  return `https://media.vigodnotut.ru/?url=${encodeURIComponent(url)}`;
};

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const SafeImage = ({ src, alt, className, ...props }: SafeImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Автоматическая трансформация ссылки
  const finalSrc = useMemo(() => getProxiedUrl(src), [src]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className || ''}`}>
      {/* Индикатор загрузки */}
      {isLoading && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <Loader2 className="w-5 h-5 animate-spin text-[#00b27a] opacity-50" />
        </div>
      )}

      {/* Заглушка при ошибке */}
      {isError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <ImageOff size={20} className="opacity-20" />
        </div>
      ) : (
        <SafeImage
          {...props}
          src={finalSrc}
          alt={alt}
          // Плавное появление картинки после загрузки
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className || ''}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setIsError(true);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};
