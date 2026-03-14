import { useState } from "react";

/**
 * OptimizedImage Component
 * Provides lazy loading, fallback handling, and loading states
 * Reduces bandwidth usage on mobile/slow networks
 */
const OptimizedImage = ({
  src,
  alt = "Image",
  fallback = "/placeholder_poster.png",
  lazy = true,
  className = "",
  onLoad,
  style,
  blur = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(!blur); // Don't show loading for blur effects
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const imageSrc = hasError ? fallback : src;

  return (
    <div className="relative overflow-hidden w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse z-10" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        style={style}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
