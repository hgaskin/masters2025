"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Info, Check } from "lucide-react";
import CountryFlag from "@/components/country-flag";

interface Golfer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  odds: string;
}

// Mock data for golfers - in real app, this would come from API/database
const mockGolfers: Golfer[] = [
  { id: "1", name: "Scottie Scheffler", country: "US", countryCode: "us", odds: "13-2" },
  { id: "2", name: "Brooks Koepka", country: "US", countryCode: "us", odds: "18-1" },
  { id: "3", name: "Patrick Cantlay", country: "US", countryCode: "us", odds: "18-1" },
  { id: "4", name: "Viktor Hovland", country: "Norway", countryCode: "no", odds: "22-1" },
  { id: "5", name: "Collin Morikawa", country: "US", countryCode: "us", odds: "22-1" },
  { id: "6", name: "Cameron Smith", country: "Australia", countryCode: "au", odds: "22-1" },
  { id: "7", name: "Jordan Spieth", country: "US", countryCode: "us", odds: "25-1" },
  { id: "8", name: "Max Homa", country: "US", countryCode: "us", odds: "25-1" },
  { id: "9", name: "Hideki Matsuyama", country: "Japan", countryCode: "jp", odds: "28-1" },
  { id: "10", name: "Tommy Fleetwood", country: "Scotland", countryCode: "gb-sct", odds: "30-1" },
  { id: "11", name: "Justin Thomas", country: "US", countryCode: "us", odds: "30-1" },
  { id: "12", name: "Will Zalatoris", country: "US", countryCode: "us", odds: "30-1" },
  { id: "13", name: "Jon Rahm", country: "Spain", countryCode: "es", odds: "8-1" },
  { id: "14", name: "Rory McIlroy", country: "Northern Ireland", countryCode: "gb", odds: "10-1" },
  { id: "15", name: "Xander Schauffele", country: "US", countryCode: "us", odds: "12-1" },
  { id: "16", name: "Jason Day", country: "Australia", countryCode: "au", odds: "15-1" },
];

// Helper function to sort golfers by odds (better odds first)
const sortByOdds = (a: Golfer, b: Golfer) => {
  // Parse odds and convert to decimal for comparison
  const parseOdds = (odds: string) => {
    const [num, den] = odds.split('-').map(Number);
    return num / den;
  };
  
  return parseOdds(a.odds) - parseOdds(b.odds);
};

export default function GolferSelection() {
  const router = useRouter();
  const [selectedGolfers, setSelectedGolfers] = useState<Golfer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const sortedGolfers = [...mockGolfers].sort(sortByOdds);
  
  const filteredGolfers = sortedGolfers.filter(golfer => 
    golfer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedGolfers.some(selected => selected.id === golfer.id)
  );

  const handleSelectGolfer = (golfer: Golfer) => {
    if (selectedGolfers.length < 8) {
      setSelectedGolfers([...selectedGolfers, golfer]);
    }
  };

  const handleRemoveGolfer = (id: string) => {
    setSelectedGolfers(selectedGolfers.filter(golfer => golfer.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedGolfers.length !== 8) {
      alert("Please select exactly 8 golfers");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push("/dashboard?success=true");
    } catch (error) {
      console.error("Error submitting team:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Selected Golfers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Your Team</h2>
          <div className="text-gray-400 flex items-center gap-2">
            <span>{selectedGolfers.length} of 8 golfers selected</span>
            <div className="relative">
              <button
                className="text-gray-400 hover:text-white"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={16} />
              </button>
              {showTooltip && (
                <div className="absolute right-0 w-64 p-3 bg-[#222] rounded-md shadow-lg text-sm text-gray-200 z-10">
                  <p>Select 8 golfers for your Masters Pool team. Best 6 scores count toward your total.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedGolfers.map(golfer => (
            <div 
              key={golfer.id}
              className="bg-[#111] border border-[#333] rounded-md overflow-hidden flex items-center p-3 relative group"
            >
              <div className="flex items-center flex-1">
                <CountryFlag 
                  countryCode={golfer.countryCode}
                  countryName={golfer.country}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium">{golfer.name}</p>
                  <p className="text-[#b49b57] text-xs">{golfer.odds}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveGolfer(golfer.id)}
                className="text-gray-400 hover:text-white ml-2"
                aria-label={`Remove ${golfer.name}`}
              >
                <X size={18} />
              </button>
            </div>
          ))}
          
          {Array.from({ length: 8 - selectedGolfers.length }).map((_, index) => (
            <div 
              key={`empty-${index}`}
              className="border border-dashed border-[#333] rounded-md p-6 flex items-center justify-center"
            >
              <span className="text-gray-500 text-sm">Select a golfer</span>
            </div>
          ))}
        </div>
        
        {selectedGolfers.length === 8 && (
          <div className="mt-6 bg-[#1e6e16]/10 border border-[#1e6e16]/30 rounded-md p-4 flex items-center">
            <Check size={20} className="text-[#1e6e16] mr-3" />
            <p className="text-green-300">Your team is complete! Review your selections and submit when ready.</p>
          </div>
        )}
      </div>
      
      {/* Divider */}
      <div className="border-t border-[#333] my-8"></div>
      
      {/* Available Golfers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Available Golfers</h2>
          <div className="text-gray-400 text-sm">
            Sorted by odds
          </div>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search golfers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#b49b57]"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGolfers.map(golfer => (
            <button
              key={golfer.id}
              onClick={() => handleSelectGolfer(golfer)}
              className="bg-[#111] border border-[#333] rounded-md p-4 text-left hover:bg-[#1a1a1a] transition-colors flex items-center"
              disabled={selectedGolfers.length >= 8}
            >
              <CountryFlag 
                countryCode={golfer.countryCode}
                countryName={golfer.country}
                size="lg"
                className="mr-3"
              />
              <div className="flex-1">
                <p className="font-medium">{golfer.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-400">{golfer.country}</span>
                  <span className="text-[#b49b57] text-sm">Odds {golfer.odds}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {filteredGolfers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchTerm ? 
              `No golfers found matching "${searchTerm}"` : 
              "No golfers available"
            }
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <div className="mt-12 text-center">
        <button
          onClick={handleSubmit}
          disabled={selectedGolfers.length !== 8 || isSubmitting}
          className={`bg-[#1e6e16] px-12 py-4 text-lg uppercase tracking-widest font-medium text-center transition-colors duration-300 ${
            selectedGolfers.length === 8 && !isSubmitting
              ? "hover:bg-[#174c10] shadow-green" 
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "SUBMITTING..." : "SUBMIT TEAM"}
        </button>
      </div>
    </div>
  );
} 