import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing use of ${site.name}'s website and services.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    h: "Acceptance",
    p: [
      `By accessing or using this website, you agree to these terms. If you do not agree, please do not use the site.`,
    ],
  },
  {
    h: "Vehicle information",
    p: [
      "We work hard to keep inventory accurate and up to date, but vehicles are sold subject to prior sale and information may contain errors. Pricing, availability, equipment, and specifications are not guaranteed and are subject to change without notice. Please verify any detail that's important to your decision before purchase.",
    ],
  },
  {
    h: "Pricing",
    p: [
      "Listed prices exclude sales tax, title, registration, and dealer documentation fees unless otherwise stated. Financing offers are estimates and depend on credit approval, term, down payment, and lender qualifications.",
    ],
  },
  {
    h: "Financing applications",
    p: [
      "Submitting a credit application authorizes us to share your information with prospective lenders. Pre-approval uses a soft credit pull. A hard inquiry occurs only when you choose to move forward with a specific offer.",
    ],
  },
  {
    h: "Communications",
    p: [
      "By providing your phone number or email, you consent to receive transactional and marketing communications from us. You may opt out of marketing at any time by replying STOP to texts, clicking unsubscribe, or contacting us.",
    ],
  },
  {
    h: "User conduct",
    p: [
      "You agree not to use the site for any unlawful purpose, to scrape inventory or pricing in bulk, to interfere with site operation, or to misrepresent your identity in any submission.",
    ],
  },
  {
    h: "Intellectual property",
    p: [
      `All content on this site — including images, text, logos, and code — is owned by ${site.name} or licensed to us and is protected by copyright and trademark laws. You may not reproduce or redistribute it without permission.`,
    ],
  },
  {
    h: "Disclaimer of warranties",
    p: [
      "The website is provided 'as is' without warranties of any kind. We do not warrant that the site will be uninterrupted or error-free. Vehicle warranties, when applicable, are governed by the separate written warranty documents you receive at purchase.",
    ],
  },
  {
    h: "Limitation of liability",
    p: [
      "To the maximum extent permitted by law, our liability for any claim arising from your use of the site is limited to the amount you have paid us, if any, in the prior twelve months.",
    ],
  },
  {
    h: "Governing law",
    p: [
      `These terms are governed by the laws of the State of ${site.address.region === "TX" ? "Texas" : site.address.region}. Any disputes will be resolved in the courts located in that state.`,
    ],
  },
  {
    h: "Changes",
    p: [
      "We may update these terms at any time. Continued use of the site after changes are posted constitutes acceptance.",
    ],
  },
  {
    h: "Contact",
    p: [
      `Questions about these terms? Email ${site.email} or call ${site.phone}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">Legal</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              Terms of Service
            </h1>
            <p className="cap-label mt-6 text-muted-foreground/60">Last updated: April 2026</p>
          </div>
        </section>

        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            {sections.map((s, i) => (
              <section
                key={s.h}
                className={`grid gap-6 py-10 lg:grid-cols-12 lg:gap-16 ${
                  i !== sections.length - 1 ? "border-b border-[hsl(var(--border))]" : ""
                }`}
              >
                <h2 className="font-display text-2xl leading-tight sm:text-3xl lg:col-span-4">
                  {s.h}
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed lg:col-span-8">
                  {s.p.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
    </>
  );
}
