"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="w-full max-w-md">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </div>
    </div>
  );
} 