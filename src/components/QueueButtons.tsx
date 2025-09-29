"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function QueueButtons() {
  const router = useRouter();

  const handleQueueSelection = (serviceName: string, serviceType: "A" | "B") => {
    const params = new URLSearchParams({ serviceName, serviceType });
    router.push(`/ticket?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl">
      <Button
        size="lg"
        className="h-40 w-full text-2xl md:text-3xl rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
        onClick={() => handleQueueSelection("Loket A - Pasien Umum", "A")}
      >
        Loket A <br /> Pasien Umum
      </Button>
      <Button
        size="lg"
        className="h-40 w-full text-2xl md:text-3xl rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-green-600 hover:bg-green-700"
        onClick={() =>
          handleQueueSelection("Loket B - Balita Ibu Hamil & Lansia", "B")
        }
      >
        Loket B <br /> Balita, Ibu Hamil & Lansia
      </Button>
    </div>
  );
}

