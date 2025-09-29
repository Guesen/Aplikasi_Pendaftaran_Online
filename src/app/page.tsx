import Header from "@/components/Header";
import QueueButtons from "@/components/QueueButtons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <QueueButtons />
      </main>
    </div>
  );
}
