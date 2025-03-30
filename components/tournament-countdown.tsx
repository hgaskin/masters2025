"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  tournamentDate: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TournamentCountdown({ tournamentDate }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const targetDate = new Date(tournamentDate);
      const totalSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
      
      if (totalSeconds <= 0) {
        // Tournament has started
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }
      
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    // Initialize countdown
    calculateTimeRemaining();
    setIsLoaded(true);
    
    // Update countdown every second
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [tournamentDate]);
  
  // Ensure values are displayed with two digits
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, "0");
  };
  
  if (!isLoaded) {
    return (
      <div className="grid grid-cols-4 gap-3 text-center">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-black/30 backdrop-blur-sm border border-[#b49b57]/20 rounded-sm">
              <div className="text-4xl font-serif text-white/30 py-3">00</div>
              <div className="bg-black/40 text-xs uppercase tracking-wider py-1.5 text-[#b49b57]/30">...</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const timeBlocks = [
    { value: timeRemaining.days, label: "DAYS" },
    { value: timeRemaining.hours, label: "HRS" },
    { value: timeRemaining.minutes, label: "MIN" },
    { value: timeRemaining.seconds, label: "SEC" }
  ];

  return (
    <div className="grid grid-cols-4 gap-3 text-center">
      {timeBlocks.map((block, index) => (
        <div key={index}>
          <div className="bg-black/30 backdrop-blur-sm border border-[#b49b57]/20 rounded-sm">
            <div className="text-4xl font-serif text-white py-3 tabular-nums tracking-wide">
              {formatNumber(block.value)}
            </div>
            <div className="bg-black/40 text-xs uppercase tracking-wider py-1.5 text-[#b49b57]/80">
              {block.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 