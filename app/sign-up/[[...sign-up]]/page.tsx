"use client";

import { SignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { CLOUDINARY_IMAGES, getRandomHistoricalMomentId } from "@/lib/constants/cloudinary-images";
import { CldImage } from "next-cloudinary";
import AuthLoading from "@/components/ui-loaders/auth-loading";
import { getMastersClerkTheme } from "@/components/clerk-component-themes/masters-clerk-theme";

export default function SignUpPage() {
  const [imageId, setImageId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [showClerk, setShowClerk] = useState(false);
  
  // Duration for animation and timeout (in milliseconds)
  const loadingDuration = 5000; // 5 seconds for better testing
  
  // Load a random historical image on mount
  useEffect(() => {
    setImageId(getRandomHistoricalMomentId());
    setLoaded(true);
    
    // Delay showing the Clerk component to create a loading effect
    const timer = setTimeout(() => {
      setShowClerk(true);
    }, loadingDuration); // Use the same duration for timeout
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      {loaded && (
        <div className="absolute inset-0 z-0">
          <CldImage
            src={imageId}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            alt="Masters historical moment"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 via-black/50 to-black/30 z-10" />
        </div>
      )}
      
      {/* Sign Up Container */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-4 pt-16">
        <div className="w-full max-w-md">
          {showClerk ? (
            <div className="transition-opacity duration-700 ease-in-out opacity-100">
              <SignUp 
                path="/sign-up" 
                routing="path" 
                signInUrl="/sign-in"
                appearance={getMastersClerkTheme()}
              />
            </div>
          ) : (
            <AuthLoading
              message="Calling the Clubhouse..."
              duration={loadingDuration} // Use the same duration variable
              progressWidth={180}
            />
          )}
        </div>
      </div>
    </div>
  );
} 