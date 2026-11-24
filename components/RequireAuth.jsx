"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/components/DataProvider";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const { booted, user } = useData();

  useEffect(() => {
    if (!booted) return;
    if (!user) router.replace("/login");
    else if (!user.class_level) router.replace("/onboarding");
  }, [booted, user, router]);

  if (!booted || !user || !user.class_level) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return children;
}