"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { personalizeTicketContent } from "@/ai/flows/ticket-content-personalization";
import { getNextQueueNumber } from "@/lib/queue";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Printer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type TicketData = {
  puskesmasName: string;
  queueNumber: string;
  serviceName: string;
  timestamp: string;
  personalizedContent: string;
};

const TICKET_STORAGE_KEY = "currentTicketData";

export default function TicketClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const isGenerating = useRef(false);

  const serviceName = useMemo(() => searchParams.get("serviceName"), [searchParams]);
  const serviceType = useMemo(() => searchParams.get("serviceType") as "A" | "B" | null, [searchParams]);

  useEffect(() => {
    const generateTicket = async () => {
      if (!serviceName || !serviceType) {
        setError("Informasi layanan tidak valid. Silakan kembali ke halaman utama.");
        setIsLoading(false);
        return;
      }
      
      const storedTicketJson = sessionStorage.getItem(TICKET_STORAGE_KEY);
      if (storedTicketJson) {
        const storedTicket: TicketData = JSON.parse(storedTicketJson);
        if (storedTicket.serviceName === serviceName) {
          setTicketData(storedTicket);
          setIsLoading(false);
          return;
        }
      }

      if (isGenerating.current) {
        return;
      }
      isGenerating.current = true;
      
      try {
        const number = getNextQueueNumber(serviceType);
        const queueNumber = `${serviceType}${String(number).padStart(3, "0")}`;
        const timestamp = new Date();
        const puskesmasName = "Puskesmas Mrebet";

        const input = {
          puskesmasName,
          queueNumber,
          serviceName,
          timestamp: timestamp.toLocaleString("id-ID"),
        };
        
        let personalizedContent = "Terima kasih atas kunjungan Anda. Jaga selalu kesehatan Anda dan keluarga.";
        try {
            const result = await personalizeTicketContent(input);
            personalizedContent = result.personalizedContent;
        } catch (aiError) {
            console.warn("AI content personalization failed, using default content.", aiError);
        }

        const newTicketData: TicketData = {
          ...input,
          personalizedContent: personalizedContent,
        };

        setTicketData(newTicketData);
        sessionStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(newTicketData));
        
      } catch (e) {
        console.error("Failed to generate ticket:", e);
        setError("Gagal membuat tiket. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
        isGenerating.current = false;
      }
    };

    generateTicket();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceName, serviceType]);

  const handleBackToHome = () => {
    sessionStorage.removeItem(TICKET_STORAGE_KEY);
    router.push("/");
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!ticketData) return;
    const ticketElement = document.getElementById("printable-ticket");
    if (!ticketElement) return;

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(ticketElement, { scale: 3 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`tiket-antrian-${ticketData.queueNumber}.pdf`);
    } catch (err) {
        console.error("Gagal membuat PDF:", err);
        setError("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
        setIsDownloading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-xl">Membuat tiket Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>
                {error}
                <Button variant="secondary" className="mt-4 w-full" onClick={handleBackToHome}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!ticketData) return null;

  return (
    <>
      <div id="printable-ticket" className="flex justify-center p-4 bg-background print:bg-white">
        <div className="w-full max-w-xs font-mono bg-white text-black p-4 rounded-lg shadow-lg print:shadow-none print:p-0">
          <div className="text-center border-b-2 border-dashed border-black pb-2">
            <h1 className="text-lg font-bold">PUSKESMAS MREBET</h1>
            <p className="text-xs">KAB. PURBALINGGA</p>
          </div>
          <div className="text-center my-4">
            <p className="text-sm">NOMOR ANTRIAN</p>
            <p className="text-6xl font-extrabold my-2">{ticketData.queueNumber}</p>
            <p className="text-sm font-semibold">{ticketData.serviceName}</p>
          </div>
          <div className="border-t-2 border-dashed border-black pt-2 text-xs mt-2">
            <p className="mb-4 text-center">{ticketData.personalizedContent}</p>
            <p className="text-center">{ticketData.timestamp}</p>
          </div>
        </div>
      </div>
      <div className="no-print fixed bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-sm">
        <div className="max-w-xs mx-auto flex flex-col gap-2">
             <Button className="w-full" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
            </Button>
            <Button variant="outline" className="w-full" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleBackToHome}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Halaman Utama
            </Button>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
