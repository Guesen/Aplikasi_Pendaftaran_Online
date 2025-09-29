"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus diisi (minimal 2 karakter)." }),
  address: z.string().min(5, { message: "Alamat harus diisi (minimal 5 karakter)." }),
  phone: z.string().optional(),
});

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("serviceName");
  const serviceType = searchParams.get("serviceType");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams({
      serviceName: serviceName || "",
      serviceType: serviceType || "",
      name: values.name,
      address: values.address,
      phone: values.phone || "",
    });
    router.push(`/ticket?${params.toString()}`);
  }

  if (!serviceName || !serviceType) {
    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Informasi layanan tidak valid. Silakan kembali ke halaman utama.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Halaman Utama</Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
        <CardHeader>
            <CardTitle>Form Pendaftaran Pasien</CardTitle>
            <CardDescription>Lengkapi data di bawah untuk mendapatkan nomor antrean di {serviceName}.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                        <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Masukkan alamat lengkap Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>No. HP (Opsional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: 081234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" size="lg">Dapatkan Nomor Antrean</Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
