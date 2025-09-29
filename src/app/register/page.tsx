import { Suspense } from "react";
import RegisterClient from "./RegisterClient";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-start p-4 pt-8">
        <Suspense fallback={<Loading />}>
          <RegisterClient />
        </Suspense>
      </main>
    </div>
  );
}
