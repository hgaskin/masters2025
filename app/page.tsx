import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero section */}
      <section className="relative w-full h-[500px] bg-gradient-to-r from-green-800 via-green-700 to-green-800">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80"
            alt="Masters Golf Tournament"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-8">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">The Gaskin Masters Pool 2025</h1>
          <p className="text-xl md:text-2xl max-w-2xl text-center mb-8">
            Join the excitement and compete with friends in our annual Masters Tournament golf pool
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Create Your Team</h3>
              <p className="text-gray-600">Select 8 golfers to form your team. The top 6 scores will count toward your final score.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Track Scores</h3>
              <p className="text-gray-600">Follow live tournament scoring and see how your picks are performing in real-time.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Win Prizes</h3>
              <p className="text-gray-600">Compete for prizes and bragging rights as your team climbs the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
