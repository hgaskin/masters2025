import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import GolferSelection from "@/components/golfer-selection";
import DraftNav from "@/components/draft-nav";
import SiteFooter from "@/components/site-footer";

export default async function DraftPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <DraftNav />
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="text-[#b49b57] text-lg uppercase tracking-widest mb-2 font-light">THE GASKIN</div>
            <h1 className="text-6xl md:text-7xl font-serif tracking-tighter mb-6 leading-none text-shadow-green">
              DRAFT YOUR TEAM
            </h1>
            <p className="text-xl text-gray-300 mt-4">
              Select eight golfers for your pool entry
            </p>
          </div>
          
          <div className="mb-12">
            <GolferSelection />
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/dashboard"
              className="inline-block bg-transparent border border-[#b49b57] text-[#b49b57] px-8 py-3 text-lg uppercase tracking-widest font-medium text-center hover:bg-[#b49b57]/10 transition-colors duration-300"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 