import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import DemarcheUX from "@/app/components/DemarcheUX";
import MethodSection from "@/app/components/MethodSection";
import FooterSection from "@/app/components/FooterSection";
import WorkTogether from "@/app/components/WorkTogether";
import BottomBar from "@/app/components/BottomBar";

export default function Home() {
  return (
    <div className="relative w-full min-w-[1440px] bg-black">
      {/* Sticky navigation */}
      <Header />

      {/* Main scrollable content */}
      <main className="bg-black pb-[92px]">
        <Hero />
        <DemarcheUX />
        <MethodSection />
        <FooterSection />
      </main>

      {/* Fixed overlays */}
      <WorkTogether />
      <BottomBar />
    </div>
  );
}
