import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full p-4 md:p-6 flex items-center justify-center bg-background">
      <div className="flex items-center justify-center gap-4 md:gap-8">
        {/* Logo Kiri */}
        <Image
          src="/logo_purbalingga.png"
          alt="Logo Kabupaten Purbalingga"
          width={70}
          height={70}
          className="h-16 w-16 md:h-20 md:w-20"
        />
        
        {/* Judul */}
        <div className="text-center">
          <p className="text-sm md:text-base text-gray-600">
            SISTEM ANTRIAN
          </p>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            PUSKESMAS MREBET
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Kabupaten Purbalingga
          </p>
        </div>

        {/* Logo Kanan */}
        <Image
          src="/logo_puskesmas.png"
          alt="Logo Puskesmas"
          width={70}
          height={70}
          className="h-16 w-16 md:h-20 md:w-20"
        />
      </div>
    </header>
  );
}
