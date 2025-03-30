"use client";

import { CldImage } from 'next-cloudinary';
import Link from "next/link";
import TournamentCountdown from "@/components/tournament-countdown";
import { CLOUDINARY_IMAGES } from "@/lib/constants/cloudinary-images";
import { useEffect, useState } from "react";

// Configure Cloudinary
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== 'du2hwlvet') {
  console.warn('Cloudinary cloud name mismatch');
}

interface HeroSectionProps {
  isAuthenticated: boolean;
  tournamentStartDate: string;
}

interface HistoricalMoment {
  title: string;
  year: string;
  description: string;
}

interface HistoricalMomentsInfo {
  [key: string]: HistoricalMoment;
}

const HISTORICAL_MOMENTS_INFO: HistoricalMomentsInfo = {
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.SARAZEN_1935]: {
    title: "The Shot Heard 'Round the World",
    year: "1935",
    description: "Gene Sarazen's double eagle on the 15th hole at Augusta National, known as the 'shot heard 'round the world', helped him force a playoff that he would win.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.BUBBA_2012]: {
    title: "Bubba's Miracle Shot",
    year: "2012",
    description: "Bubba Watson's incredible hook shot from the trees on the 10th hole in the playoff secured his first green jacket.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.TIGER_2005]: {
    title: "Tiger's Iconic Chip",
    year: "2005",
    description: "Tiger Woods' miraculous chip-in on the 16th hole that paused on the lip before dropping, en route to his fourth Masters victory.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.JACK_1986]: {
    title: "The Golden Bear's Last Roar",
    year: "1986",
    description: "Jack Nicklaus' historic back-nine charge to win his sixth Masters at age 46, becoming the oldest champion in tournament history.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.PHIL_2010]: {
    title: "Phil's Pine Straw Miracle",
    year: "2010",
    description: "Phil Mickelson's daring shot from the pine straw through a narrow gap between trees on the 13th hole, leading to his third Masters win.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.LOUIS_2012]: {
    title: "Double Eagle Magic",
    year: "2012",
    description: "Louis Oosthuizen's incredible albatross on the par-5 2nd hole, only the fourth double eagle in Masters history.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.MIZE_1987]: {
    title: "The Augusta Native's Dream",
    year: "1987",
    description: "Local favorite Larry Mize's stunning 140-foot chip-in on the second playoff hole to defeat Greg Norman.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.JACK_1975]: {
    title: "The Three-Way Battle",
    year: "1975",
    description: "An epic final round duel between Jack Nicklaus, Johnny Miller, and Tom Weiskopf, with Nicklaus prevailing by one shot.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.ARNIE_1962]: {
    title: "Arnie's Army Marches On",
    year: "1962",
    description: "Arnold Palmer's playoff victory over Gary Player and Dow Finsterwald, earning his third green jacket.",
  },
  [CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.LYLE_1988]: {
    title: "Sandy's Fairway Bunker Magic",
    year: "1988",
    description: "Sandy Lyle's clutch birdie from the fairway bunker on 18 to become the first British player to win the Masters.",
  }
};

export default function HeroSection({ isAuthenticated, tournamentStartDate }: HeroSectionProps) {
  const [currentImageId, setCurrentImageId] = useState<string>(CLOUDINARY_IMAGES.HISTORICAL_MOMENTS.SARAZEN_1935);
  const [isClient, setIsClient] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        const moments = Object.values(CLOUDINARY_IMAGES.HISTORICAL_MOMENTS);
        const randomIndex = Math.floor(Math.random() * moments.length);
        setCurrentImageId(moments[randomIndex]);
        setIsTransitioning(false);
      }, 500);
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const currentMoment = HISTORICAL_MOMENTS_INFO[currentImageId];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <CldImage
          src={currentImageId}
          alt="Masters Historical Moment"
          fill
          className={`object-cover object-center transition-opacity duration-1000 ${
            isClient ? 'opacity-100' : 'opacity-0'
          } ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
          priority
          sizes="100vw"
          effects={[{ brightness: "-20" }]}
          format="auto"
          quality="auto"
          preserveTransformations={true}
        />
        {/* Gradient overlay with very subtle green hue */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,40,20,0.8)] via-[rgba(10,10,10,0.75)] to-[rgba(0,0,0,0.8)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Title */}
        <h2 className="text-[#b49b57] text-lg md:text-2xl font-serif uppercase tracking-widest font-light mb-2">
          THE GASKIN
        </h2>
        
        <h1 className="text-white text-5xl md:text-8xl font-serif font-light leading-none mb-10">
          MASTERS 2025
        </h1>

        {/* Countdown */}
        <div className="w-full max-w-md mx-auto mb-12">
          <TournamentCountdown tournamentDate={tournamentStartDate} />
        </div>

        {/* Subtitle */}
        <h3 className="text-3xl md:text-5xl font-serif text-white mb-12">
          Create your team for the<br />2025 Masters Tournament
        </h3>

        {/* Action Button */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/sign-up"}
          className="inline-block bg-[#1a5c1a]/90 backdrop-blur-sm border border-[#b49b57]/30 rounded-sm px-12 py-4 text-base uppercase tracking-widest font-medium text-white hover:bg-[#1a5c1a] transition-all duration-300 shadow-sm"
        >
          ENTER DASHBOARD
        </Link>
      </div>

      {/* Historical Moment Info - Small */}
      {currentMoment && (
        <div className="absolute bottom-4 right-4 z-20 opacity-80 hover:opacity-100">
          <div className="max-w-xs">
            <div className="bg-black/60 backdrop-blur-sm rounded-sm p-2 text-white/90">
              <p className="text-xs text-white/90">{currentMoment.title} ({currentMoment.year})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 