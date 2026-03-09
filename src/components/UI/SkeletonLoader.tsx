interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'avatar' | 'button';
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

export default function SkeletonLoader({ 
  type = 'card', 
  width = '100%', 
  height = '20px', 
  className = '',
  lines = 1 
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded";
  
  const animationStyle = {
    animation: 'shimmer 1.5s ease-in-out infinite',
  };

  if (type === 'card') {
    return (
      <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
        <div 
          className={`${baseClasses} h-48 w-full`}
          style={animationStyle}
        />
        <div className="p-4 space-y-3">
          <div 
            className={`${baseClasses} h-4 w-3/4`}
            style={animationStyle}
          />
          <div 
            className={`${baseClasses} h-4 w-1/2`}
            style={animationStyle}
          />
          <div className="flex items-center justify-between pt-2">
            <div 
              className={`${baseClasses} h-6 w-16 rounded`}
              style={animationStyle}
            />
            <div 
              className={`${baseClasses} h-8 w-20 rounded`}
              style={animationStyle}
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-4`}
            style={{
              ...animationStyle,
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div 
        className={`${baseClasses} h-10 w-10 rounded-full ${className}`}
        style={animationStyle}
      />
    );
  }

  if (type === 'button') {
    return (
      <div 
        className={`${baseClasses} h-10 w-24 rounded ${className}`}
        style={animationStyle}
      />
    );
  }

  return (
    <div 
      className={`${baseClasses} ${className}`}
      style={{ ...animationStyle, width, height }}
    />
  );
}

// Add shimmer animation to global styles
export const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;
