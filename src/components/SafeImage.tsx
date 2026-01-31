import React, { useState } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export const SafeImage = ({ 
  src, 
  alt, 
  fallback = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop", 
  className,
  ...props 
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      {...props}
      src={imgSrc || fallback}
      alt={alt || "image"}
      className={className}
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
};
