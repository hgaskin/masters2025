"use client";

import { ReactNode, useEffect, useRef } from "react";

// Loader type definition
type LoaderVariant = "default" | "golfball" | "classic" | "pgatour" | "augusta";

interface AuthLoadingProps {
  /** Text to display during loading (e.g., "Preparing your sign in...") */
  message?: string;
  /** Duration of the loading animation in milliseconds */
  duration?: number;
  /** Color for the progress bar (default: Masters light green) */
  progressColor?: string;
  /** Main spinner border color (default: Masters green) */
  spinnerColor?: string;
  /** Secondary spinner color (default: Masters gold) */
  spinnerAccentColor?: string;
  /** Inner circle color (default: Masters darker green) */
  innerCircleColor?: string;
  /** Width of the progress bar in pixels */
  progressWidth?: number;
  /** Whether to show a pulsing message */
  pulsingMessage?: boolean;
  /** Custom content to show in center instead of the default spinner */
  customIcon?: ReactNode;
  /** Animation variant to use */
  variant?: LoaderVariant;
}

// Simple dimple pattern
const GOLF_BALL_DIMPLES = [
  { top: "25%", left: "25%", size: "4px" },
  { top: "25%", left: "75%", size: "4px" },
  { top: "50%", left: "15%", size: "4px" },
  { top: "50%", left: "85%", size: "4px" },
  { top: "75%", left: "25%", size: "4px" },
  { top: "75%", left: "75%", size: "4px" },
];

export default function AuthLoading({
  message = "Preparing...",
  duration = 1800,
  progressColor = "#CBDE6A",
  spinnerColor = "#006747",
  spinnerAccentColor = "#d4af37",
  innerCircleColor = "#1a5a14",
  progressWidth = 160,
  pulsingMessage = true,
  customIcon,
  variant = "default",
}: AuthLoadingProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Apply animation with correct duration and ensure it starts from 0 width
  useEffect(() => {
    if (progressBarRef.current) {
      // First ensure the bar starts at 0 width
      progressBarRef.current.style.width = '0%';
      
      // Force a reflow to ensure the initial state is rendered before animation starts
      void progressBarRef.current.offsetWidth;
      
      // Then add the animation that grows it to 100% width
      progressBarRef.current.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      
      // Small delay to ensure transition is applied
      setTimeout(() => {
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '100%';
        }
      }, 50);
    }
  }, [duration]);

  // Render the selected loader variant
  const renderLoader = () => {
    if (customIcon) {
      return <div className="mb-4">{customIcon}</div>;
    }

    switch (variant) {
      case "golfball":
        return (
          <div className="relative w-16 h-16 mb-4">
            {/* Simple spinning golf ball */}
            <div className="absolute w-16 h-16 animate-spin" style={{ animationDuration: "3s" }}>
              {/* Basic golf ball */}
              <div 
                className="w-full h-full rounded-full"
                style={{ 
                  background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}
              >
                {/* Simple number */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-[14px] font-bold text-slate-400">25</div>
                </div>
                
                {/* Basic dimples */}
                {GOLF_BALL_DIMPLES.map((dimple, i) => (
                  <div 
                    key={i} 
                    className="absolute rounded-full bg-gray-100" 
                    style={{ 
                      top: dimple.top,
                      left: dimple.left,
                      width: dimple.size,
                      height: dimple.size
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Simple shadow */}
            <div 
              className="absolute w-12 h-2 rounded-full left-1/2 bottom-0 -translate-x-1/2"
              style={{ 
                background: "radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 70%)"
              }}
            />
          </div>
        );

      case "classic":
        return (
          <div className="relative w-16 h-16 mb-4">
            {/* Base circle */}
            <div className="absolute inset-0 border-4 rounded-full border-gray-300 opacity-25" />
            {/* Spinner */}
            <div 
              className="absolute inset-0 border-4 border-l-transparent border-r-transparent border-b-transparent rounded-full animate-spin" 
              style={{ 
                borderTopColor: spinnerColor,
                animationDuration: "0.8s"
              }} 
            />
            {/* Center dot */}
            <div 
              className="absolute w-6 h-6 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
              style={{ backgroundColor: innerCircleColor }} 
            />
          </div>
        );

      case "pgatour":
        return (
          <div className="relative w-20 h-16 mb-4">
            <div className="flex items-end justify-center h-full space-x-1">
              {/* PGA Tour-inspired animation with three bars */}
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-3 bg-opacity-90 rounded-t-sm animate-[bounce_1s_ease-in-out_infinite]" 
                  style={{ 
                    backgroundColor: i === 0 ? spinnerColor : i === 1 ? spinnerAccentColor : progressColor,
                    height: `${5 + i * 3}0%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1s"
                  }}
                />
              ))}
            </div>
          </div>
        );
        
      case "augusta":
        return (
          <div className="relative w-20 h-20 mb-4">
            {/* Green jacket inspired animation */}
            <div className="absolute inset-0 rounded-full overflow-hidden border-2" style={{ borderColor: spinnerAccentColor }}>
              <div className="absolute inset-0" style={{ backgroundColor: spinnerColor }}>
                <div className="absolute top-0 left-0 w-full h-full animate-pulse" 
                     style={{ 
                       backgroundImage: `radial-gradient(circle at center, ${innerCircleColor} 0%, transparent 70%)`,
                       animationDuration: "2s"
                     }} 
                />
              </div>
            </div>
            {/* Masters flag */}
            <div className="absolute top-1 right-1 w-8 h-8 animate-[wave_2s_ease-in-out_infinite]">
              <div className="w-1 h-8 bg-white absolute left-0"></div>
              <div className="w-7 h-4 absolute left-1 top-0" style={{ backgroundColor: spinnerAccentColor }}></div>
            </div>
          </div>
        );

      default: // "default"
        return (
          <div className="relative w-16 h-16 mb-4">
            {/* Improved default spinner */}
            <div 
              className="absolute w-16 h-16 border-4 border-l-transparent rounded-full animate-spin"
              style={{ 
                borderTopColor: spinnerColor,
                borderRightColor: progressColor,
                borderBottomColor: spinnerAccentColor,
                animationDuration: "1s"
              }}
            />
            <div 
              className="absolute w-8 h-8 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ 
                backgroundColor: innerCircleColor,
                animationDuration: "1.5s" 
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {renderLoader()}
      
      <p className={`text-white text-sm font-light ${pulsingMessage ? 'animate-pulse' : ''}`}
         style={{ animationDuration: "2s" }}>
        {message}
      </p>
      
      <div className="mt-4 h-1 bg-gray-700 overflow-hidden rounded-full" style={{ width: `${progressWidth}px` }}>
        <div 
          ref={progressBarRef}
          className="h-full rounded-full" 
          style={{ backgroundColor: progressColor }}
        />
      </div>
    </div>
  );
} 