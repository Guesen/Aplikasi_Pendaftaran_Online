"use client";

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, CheckCircle } from 'lucide-react';
import { personalizeTicketContent } from '@/ai/flows/ticket-content-personalization';

export default function TicketClient() {
  const searchParams = useSearchParams();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const queueNumber = useMemo(() => searchParams.get("queueNumber"), [searchParams]);
  const serviceName = useMemo(() => searchParams.get("serviceName"), [searchParams]);
  const timestamp = useMemo(() => new Date().toLocaleString("id-ID"), []);

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
      }, 500); // Wait half a second for content to render
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
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 print:bg-white print:justify-start">
        <div 
            ref={ticketRef} 
            className="w-full max-w-sm bg-white p-6 shadow-lg rounded-lg text-center font-mono print:shadow-none print:max-w-full"
            style={{width: '75mm', minHeight: '115mm'}}
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
                    <p>Memuat pesan...</p>
                ) : (
                    <p>{personalizedMessage}</p>
                )}
            </div>
        </div>

        <div className="mt-8 text-center print:hidden">
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
                        Kembali ke Halaman Utama
                    </Button>
                </div>
            )}
        </div>

    </div>
  );
}
