import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import HeroSection from "@/components/hero-section";
import SiteFooter from "@/components/site-footer";

export default async function Home() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;
  
  const tournamentStartDate = "2025-04-10T08:00:00";

  return (
    <div className="flex flex-col min-h-screen bg-[#050705]">
      <Suspense fallback={<div className="min-h-screen bg-[#050705]" />}>
        <HeroSection isAuthenticated={isAuthenticated} tournamentStartDate={tournamentStartDate} />
      </Suspense>

      <SiteFooter />
    </div>
  );
}
