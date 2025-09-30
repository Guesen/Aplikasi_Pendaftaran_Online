"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Printer, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { personalizeTicketContent } from '@/ai/flows/ticket-content-personalization';

// ESC/POS Commands as Uint8Arrays
const ESC_POS = {
  INIT: new Uint8Array([0x1B, 0x40]),
  ALIGN_CENTER: new Uint8Array([0x1B, 0x61, 1]),
  ALIGN_LEFT: new Uint8Array([0x1B, 0x61, 0]),
  BOLD_ON: new Uint8Array([0x1B, 0x45, 1]),
  BOLD_OFF: new Uint8Array([0x1B, 0x45, 0]),
  SIZE_NORMAL: new Uint8Array([0x1D, 0x21, 0x00]),
  SIZE_DOUBLE_HEIGHT_WIDTH: new Uint8Array([0x1D, 0x21, 0x11]),
  CUT: new Uint8Array([0x1D, 0x56, 1]),
  LINE_FEED: new Uint8Array([0x0A]),
};

// Helper to encode text
const textEncoder = new TextEncoder();

type PrinterContextType = {
  connectPrinter: () => void;
  printTicket: (data: { queueNumber: string; serviceName: string; }) => void;
  isConnected: boolean;
  isConnecting: boolean;
};

const PrinterContext = createContext<PrinterContextType | null>(null);

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error("usePrinter must be used within a PrinterManager");
  }
  return context;
}

type TicketData = {
    queueNumber: string;
    serviceName: string;
};

export default function PrinterManager({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<USBDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const isConnected = !!device;

  const connectPrinter = useCallback(async () => {
    if (!navigator.usb) {
      toast({
        variant: "destructive",
        title: "Browser Tidak Mendukung",
        description: "Fitur ini memerlukan browser seperti Google Chrome atau Microsoft Edge.",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const selectedDevice = await navigator.usb.requestDevice({ filters: [] });
      await selectedDevice.open();

      let endpointNumber: number | null = null;

      // Find the correct interface and endpoint
      for (const config of selectedDevice.configurations) {
        for (const iface of config.interfaces) {
          for (const alt of iface.alternates) {
            if (alt.interfaceClass === 7) { // 7 is the class code for printers
              for (const endpoint of alt.endpoints) {
                if (endpoint.direction === "out") {
                   await selectedDevice.claimInterface(iface.interfaceNumber);
                   endpointNumber = endpoint.endpointNumber;
                   break;
                }
              }
            }
            if(endpointNumber) break;
          }
          if(endpointNumber) break;
        }
        if(endpointNumber) break;
      }
      
      if (!endpointNumber) {
        throw new Error("Endpoint printer tidak ditemukan. Pastikan driver ter-release. Anda bisa menggunakan Zadig untuk mengganti driver ke libusb-win32.");
      }
      
      // Store endpoint number in a custom property
      (selectedDevice as any).endpointNumber = endpointNumber;

      setDevice(selectedDevice);
      toast({
        title: "Printer Terhubung",
        description: `Printer ${selectedDevice.productName} berhasil terhubung.`,
        className: "bg-green-600 text-white",
      });
    } catch (error: any) {
      console.error("Gagal menghubungkan printer:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menghubungkan Printer",
        description: error.message || "Pastikan printer terhubung dan tidak digunakan oleh program lain.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const printTicket = useCallback(async (data: TicketData) => {
    if (!device) {
      toast({ variant: "destructive", title: "Printer tidak terhubung." });
      return;
    }
    
    const endpoint = (device as any).endpointNumber;
    if (!endpoint) {
        toast({ variant: "destructive", title: "Endpoint printer tidak valid." });
        return;
    }

    try {
      const timestamp = new Date().toLocaleString("id-ID");
      const line = '--------------------------------\n';
      
      const personalized = await personalizeTicketContent({
          puskesmasName: "PUSKESMAS MREBET",
          queueNumber: data.queueNumber,
          serviceName: data.serviceName,
          timestamp,
      });
      const messageToDisplay = personalized.personalizedContent + '\n';

      const commands = [
        ESC_POS.INIT,
        ESC_POS.ALIGN_CENTER,
        textEncoder.encode("PUSKESMAS MREBET\n"),
        textEncoder.encode("KAB. PURBALINGGA\n"),
        textEncoder.encode(line),
        ESC_POS.LINE_FEED,
        textEncoder.encode("NOMOR ANTRIAN\n"),
        ESC_POS.SIZE_DOUBLE_HEIGHT_WIDTH,
        ESC_POS.BOLD_ON,
        textEncoder.encode(`${data.queueNumber}\n`),
        ESC_POS.BOLD_OFF,
        ESC_POS.SIZE_NORMAL,
        ESC_POS.LINE_FEED,
        textEncoder.encode(`${data.serviceName}\n`),
        ESC_POS.LINE_FEED,
        textEncoder.encode(line),
        ESC_POS.ALIGN_LEFT,
        textEncoder.encode(`Waktu: ${timestamp}\n`),
        ESC_POS.LINE_FEED,
        ESC_POS.ALIGN_CENTER,
        textEncoder.encode(messageToDisplay),
        // Menambahkan baris kosong untuk menambah tinggi kertas
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.LINE_FEED,
        ESC_POS.CUT,
      ];

      // Combine all commands into one buffer
      const totalLength = commands.reduce((sum, arr) => sum + arr.length, 0);
      const buffer = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of commands) {
        buffer.set(arr, offset);
        offset += arr.length;
      }
      
      await device.transferOut(endpoint, buffer);

      toast({
        title: "Cetak Berhasil",
        description: `Tiket ${data.queueNumber} telah dikirim ke printer.`,
        className: "bg-blue-600 text-white",
      });
    } catch (error: any) {
      console.error("Gagal mencetak:", error);
      toast({
        variant: "destructive",
        title: "Gagal Mencetak",
        description: error.message,
      });
    }
  }, [device, toast]);

  const value = { connectPrinter, printTicket, isConnected, isConnecting };

  return (
    <PrinterContext.Provider value={value}>
        {!isConnected && (
            <div className="fixed bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-sm z-10">
                <div className='max-w-md mx-auto'>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Printer Belum Terhubung</AlertTitle>
                    <AlertDescription>
                        Untuk mencetak tiket, hubungkan printer termal Anda melalui USB dan klik tombol di bawah ini.
                        <Button className="w-full mt-3" onClick={connectPrinter} disabled={isConnecting}>
                            {isConnecting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Printer className="mr-2 h-4 w-4" />
                            )}
                            Hubungkan Printer
                        </Button>
                    </AlertDescription>
                </Alert>
                </div>
            </div>
        )}
        {isConnected && (
             <div className="fixed bottom-4 right-4 z-10">
                 <div className="flex items-center gap-2 bg-green-100 text-green-800 p-2 rounded-full shadow-lg">
                    <CheckCircle className="h-5 w-5"/>
                    <span className="font-medium text-sm pr-2">Printer Terhubung</span>
                 </div>
            </div>
        )}
        {children}
    </PrinterContext.Provider>
  );
}
