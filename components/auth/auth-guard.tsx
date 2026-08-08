"use client";

import React from "react";
import { useAuth } from "./auth-provider";
import { AuthGate } from "./auth-gate";
import { Activity } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isFirebaseActive } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background space-y-4">
        <div className="p-4 bg-primary/10 text-primary rounded-full animate-bounce">
          <Activity className="w-10 h-10" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Connecting to Cloud Personnel Database...
        </p>
      </div>
    );
  }

  if (isFirebaseActive && !user) {
    return <AuthGate />;
  }

  return <>{children}</>;
}
