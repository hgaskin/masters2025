"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (isAuthRoute) return null;

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-[#d4af37] font-serif text-2xl font-light tracking-wide">
            Green Jacket '25
          </Link>
          <nav className="ml-12 hidden md:flex">
            <SignedIn>
              <ul className="flex space-x-8">
                <li>
                  <Link href="/my-teams" className="text-white/90 hover:text-[#d4af37] transition-colors duration-300 text-sm uppercase tracking-wider">
                    My Teams
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="text-white/90 hover:text-[#d4af37] transition-colors duration-300 text-sm uppercase tracking-wider">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/scoring-rules" className="text-white/90 hover:text-[#d4af37] transition-colors duration-300 text-sm uppercase tracking-wider">
                    Scoring & Rules
                  </Link>
                </li>
              </ul>
            </SignedIn>
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <SignedOut>
            <div className="hidden sm:flex sm:space-x-4">
              <SignInButton mode="modal">
                <button className="px-6 py-2 text-sm text-[#d4af37] border border-[#d4af37] hover:bg-[#d4af37]/10 rounded transition-colors duration-300 uppercase tracking-wider">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 text-sm bg-[#1a5a14] text-white hover:bg-[#246b1c] rounded transition-colors duration-300 uppercase tracking-wider">
                  Join Pool
                </button>
              </SignUpButton>
            </div>
            <div className="sm:hidden">
              <SignInButton mode="modal">
                <button className="p-2 text-[#d4af37]">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <Link 
              href="/dashboard" 
              className="hidden md:block text-sm text-white/90 hover:text-[#d4af37] transition-colors duration-300 uppercase tracking-wider"
            >
              Dashboard
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              userProfileMode="modal"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
} 