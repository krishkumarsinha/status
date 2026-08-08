"use client";

import React from "react";
import { useAuth } from "./auth-provider";
import { AuthGate } from "./auth-gate";
import { CreativeLoading } from "@/components/ui/creative-loading";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isFirebaseActive } = useAuth();

  if (isLoading) {
    return <CreativeLoading message="Connecting to Cloud Personnel Database..." />;
  }

  if (isFirebaseActive && !user) {
    return <AuthGate />;
  }

  return <>{children}</>;
}
