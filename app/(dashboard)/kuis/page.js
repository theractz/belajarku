"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import KuisPage from "@/components/KuisPage";

function KuisRouteContent() {
  const searchParams = useSearchParams();
  return <KuisPage initialMaterialId={searchParams.get("material") || ""} />;
}

export default function KuisRoute() {
  return (
    <Suspense
      fallback={<div className="py-20 text-center text-sm text-muted">Memuat...</div>}
    >
      <KuisRouteContent />
    </Suspense>
  );
}
