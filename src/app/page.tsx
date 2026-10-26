import type { Metadata } from "next";
import { StageLoader } from "@/components/stage/StageLoader";
import { Preloader } from "@/components/ui/Preloader";
import { Header } from "@/components/ui/Header";
import { ScrollClock } from "@/components/ui/ScrollClock";
import { CarSection } from "@/components/sections/CarSection";
import { Ride } from "@/components/sections/Ride";
import { Services } from "@/components/sections/Services";
import { Voices } from "@/components/sections/Voices";
import { Book } from "@/components/sections/Book";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Preloader />
      <StageLoader />
      <Header />
      <main className="relative z-10">
        <CarSection />
        <Ride />
        <Services />
        <Voices />
        <Book />
      </main>
      <Footer />
      <ScrollClock />
    </>
  );
}
