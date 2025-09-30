"use client";

import { Button } from "@/components/ui/button";
import { getNextQueueNumber } from "@/lib/queue";
import { usePrinter } from "./PrinterManager";

export default function QueueButtons() {
  const { printTicket, isConnected } = usePrinter();

  const handleQueueSelection = (serviceName: string, serviceType: "A" | "B") => {
    const number = getNextQueueNumber(serviceType);
    const queueNumber = `${serviceType}${String(number).padStart(3, "0")}`;
    
    printTicket({
      queueNumber,
      serviceName,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl">
      <Button
        size="lg"
        className="h-40 w-full text-2xl md:text-3xl rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        onClick={() => handleQueueSelection("Loket A - Pasien Umum", "A")}
        disabled={!isConnected}
      >
        Loket A <br /> Pasien Umum
      </Button>
      <Button
        size="lg"
        className="h-40 w-full text-2xl md:text-3xl rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        onClick={() =>
          handleQueueSelection("Loket B - Balita Ibu Hamil & Lansia", "B")
        }
        disabled={!isConnected}
      >
        Loket B <br /> Balita, Ibu Hamil & Lansia
      </Button>
    </div>
  );
}
