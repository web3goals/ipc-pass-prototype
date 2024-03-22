import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 lg:h-[calc(100vh-4rem)]">
      {/* Image */}
      <section className="flex flex-col items-center max-w-[400px]">
        <Image
          src="/images/ipc.png"
          alt="IPC"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full"
        />
      </section>
      {/* Text with button */}
      <section className="flex flex-col items-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-center md:text-5xl">
          IPC subnets in a few clicks
        </h1>
        <h2 className="text-2xl font-normal tracking-tight text-center text-muted-foreground mt-2">
          A platform for deploying and managing InterPlanetary Consensus (IPC)
          subnets
        </h2>
        <Link href="/dashboard">
          <Button className="mt-8" size="lg">
            Open Dashboard
          </Button>
        </Link>
      </section>
    </div>
  );
}
