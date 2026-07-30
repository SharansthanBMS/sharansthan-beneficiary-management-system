import { useState, useEffect, useMemo } from 'react';
import { getDirectDriveUrl } from './utils/imageUtils';

export const Avatar = ({ src, alt, fallback, className }: { src: string | undefined | null, alt: string, fallback: string, className?: string }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const directSrc = useMemo(() => getDirectDriveUrl(src), [src]);

  useEffect(() => {
    // This logs the actual requested URL to the browser console
    if (src || directSrc) {
      console.log("Avatar Debug - original src:", src);
      console.log("Avatar Debug - directSrc (ACTUAL URL REQUESTED):", directSrc);
    }
  }, [src, directSrc]);

  if (directSrc && !error) {
    return <img src={directSrc} alt={alt} loading="lazy" className={className} 
      onError={(e) => {
        console.error("Avatar Debug - Image failed to load:", directSrc, e);
        setError(true);
      }} 
      onLoad={() => {
        console.log("Avatar Debug - Image loaded successfully:", directSrc);
      }}
    />;
  }

  return <div className={`flex items-center justify-center w-full h-full bg-slateSurface ${className}`}>{fallback}</div>;
};
