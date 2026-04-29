import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { Hero } from "@/components/landing/Hero";
import { QuickSearch } from "@/components/landing/QuickSearch";
import { FeaturedInventory } from "@/components/landing/FeaturedInventory";
import { BodyTypeGrid } from "@/components/landing/BodyTypeGrid";
import { PreApprovalBanner } from "@/components/landing/PreApprovalBanner";
import { ValueProps } from "@/components/landing/ValueProps";
import { TradeInTeaser } from "@/components/landing/TradeInTeaser";
import { Testimonials } from "@/components/landing/Testimonials";
import { LiveGrid } from "@/components/landing/LiveGrid";
import { Showroom } from "@/components/landing/Showroom";
import { CreditApplication } from "@/components/credit/CreditApplication";

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-text focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Hero />
        <QuickSearch />
        <FeaturedInventory />
        <BodyTypeGrid />
        <PreApprovalBanner />
        <ValueProps />
        <TradeInTeaser />
        <Testimonials />
        <LiveGrid />
        <Showroom />
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
    </>
  );
}
