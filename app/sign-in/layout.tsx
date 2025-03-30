"use client";

import { ReactNode } from "react";
import Link from "next/link";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Custom Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-black/80 backdrop-blur-sm shadow-md">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-serif text-white text-xl">MASTERS 2025</Link>
            <div className="text-white text-sm">April 10-13, 2025</div>
          </div>
        </div>
      </header>
      {children}
    </>
  );
} 