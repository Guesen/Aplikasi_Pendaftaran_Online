import { Suspense } from "react";
import TicketClient from "./TicketClient";
import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-sm p-8 space-y-4 bg-white rounded-lg shadow-md">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <div className="border-t border-dashed my-4"></div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-6 w-1/2" />
                <div className="border-t border-dashed my-4"></div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}

export default function TicketPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TicketClient />
    </Suspense>
  );
}
