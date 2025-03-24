import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Masters25",
  description: "The Gaskin Masters Pool 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        >
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="text-green-800 font-bold text-xl">
                  Masters25
                </Link>
                <nav className="ml-8 hidden md:flex">
                  <SignedIn>
                    <ul className="flex space-x-6">
                      <li>
                        <Link href="/" className="text-gray-600 hover:text-green-800 transition-colors">
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard" className="text-gray-600 hover:text-green-800 transition-colors">
                          Dashboard
                        </Link>
                      </li>
                    </ul>
                  </SignedIn>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <SignedOut>
                  <div className="hidden sm:flex sm:space-x-2">
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-sm text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-4 py-2 text-sm bg-green-800 text-white hover:bg-green-700 rounded-lg transition-colors">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                  <div className="sm:hidden">
                    <SignInButton mode="modal">
                      <button className="p-2 text-green-800">
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
                <SignedIn>
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
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
