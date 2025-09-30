"use client";

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import { personalizeTicketContent } from '@/ai/flows/ticket-content-personalization';

export default function TicketClient() {
  const searchParams = useSearchParams();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const queueNumber = useMemo(() => searchParams.get("queueNumber"), [searchParams]);
  const serviceName = useMemo(() => searchParams.get("serviceName"), [searchParams]);
  const timestamp = useMemo(() => new Date().toLocaleString("id-ID", {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).replace(/\./g, ':'), []);

  useEffect(() => {
    const generateContent = async () => {
      if (!queueNumber || !serviceName) return;
      setIsAiLoading(true);
      try {
        const result = await personalizeTicketContent({
          puskesmasName: "PUSKESMAS MREBET",
          queueNumber,
          serviceName,
          timestamp,
        });
        setPersonalizedMessage(result.personalizedContent);
      } catch (error) {
        console.error("AI personalization failed:", error);
        setPersonalizedMessage("Terima kasih atas kunjungan Anda. Semoga lekas sembuh!");
      } finally {
        setIsAiLoading(false);
      }
    };
    generateContent();
  }, [queueNumber, serviceName, timestamp]);
  
  useEffect(() => {
    if (!isAiLoading) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [isAiLoading]);

  if (!queueNumber || !serviceName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="animate-spin h-12 w-12 mb-4" />
        <p className="text-lg">Memuat data tiket...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body, html {
            margin: 0;
            padding: 0;
            width: 75mm;
          }
          .print-container {
            margin: 0;
            padding: 0;
            display: block !important;
          }
          .ticket-content {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            display: block;
            page-break-after: always;
          }
          .no-print {
            display: none !important;
          }
        }
        @page {
          size: 75mm auto;
          margin: 0;
        }
      `}</style>
      <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 print:bg-white print:justify-start print-container">
          <div 
              ref={ticketRef} 
              className="w-[75mm] bg-white p-4 shadow-lg rounded-lg text-center font-mono print:shadow-none print:w-full ticket-content"
          >
              <h1 className="text-xl font-bold">PUSKESMAS MREBET</h1>
              <p className="text-sm">KAB. PURBALINGGA</p>
              <hr className="border-dashed border-black my-3" />
              
              <p className="text-lg mt-4">NOMOR ANTRIAN</p>
              <p className="text-6xl font-extrabold my-2">{queueNumber}</p>
              
              <p className="text-lg font-semibold">{serviceName}</p>
              <hr className="border-dashed border-black my-3" />

              <div className="text-left text-xs">
                  <p>Waktu: {timestamp}</p>
              </div>

              <div className="text-center text-xs mt-4 min-h-[40px]">
                  {isAiLoading ? (
                      <div className="flex justify-center items-center">
                        <Loader2 className="animate-spin h-4 w-4 mr-2"/> 
                        <span>Memuat pesan...</span>
                      </div>
                  ) : (
                      <p className="px-2">{personalizedMessage}</p>
                  )}
              </div>
          </div>

          <div className="mt-8 text-center print:hidden no-print">
              {isPrinting ? (
                  <div className="flex items-center text-gray-600">
                      <Loader2 className="animate-spin mr-2" />
                      <span>Mempersiapkan cetak...</span>
                  </div>
              ) : (
                  <div className="flex flex-col items-center gap-4">
                       <div className="flex items-center text-green-600">
                          <CheckCircle className="mr-2" />
                          <span>Jendela cetak sudah terbuka.</span>
                      </div>
                      <Button onClick={() => window.print()}>
                          <Printer className="mr-2 h-4 w-4" />
                          Cetak Ulang
                      </Button>
                       <Button variant="outline" onClick={() => window.location.href = '/'}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Kembali
                      </Button>
                  </div>
              )}
          </div>
      </div>
    </>
  );
}

