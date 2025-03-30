"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DraftNav() {
  const pathname = usePathname();
  
  return (
    <nav className="border-b border-[#333] py-5 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="text-gray-400 text-sm">
          <div className="flex items-center">
            <span className="text-[#b49b57] mr-6">Draft closes in 3d 14h 22m</span>
            <Link 
              href="/help/draft-rules" 
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <HelpCircle size={16} />
              <span>Draft Rules</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 