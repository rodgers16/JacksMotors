import Image from "next/image";
import { CreditApplicationTrigger } from "@/components/credit/CreditApplicationTrigger";

const banner = "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1600&q=80&auto=format&fit=crop";

export function PreApprovalBanner() {
  return (
    <section aria-labelledby="preapprove-heading" className="relative isolate overflow-hidden border-y border-[hsl(var(--border))]">
      <Image
        src={banner}
        alt=""
        fill
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-10 cinema-vignette" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-black/40" aria-hidden />

      <div className="mx-auto max-w-[1600px] px-5 py-24 text-center sm:px-8 sm:py-32 lg:px-12">
        <p className="eyebrow">Financing</p>
        <h2 id="preapprove-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-7xl lg:text-[88px]">
          Know your number
          <br />
          in 60 seconds.
        </h2>
        <p className="cap-label mt-6 max-w-md mx-auto text-muted-foreground">
          Soft pull · No impact to your credit score · Approvals for every credit story
        </p>
        <div className="mt-10 flex justify-center">
          <CreditApplicationTrigger size="lg" variant="primary">
            Start Pre-Approval
          </CreditApplicationTrigger>
        </div>
      </div>
    </section>
  );
}
