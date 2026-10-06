import type { ReactNode } from "react";

/*
 * Shared layout for the Privacy Policy and Terms & Conditions pages:
 * a simple header back to the home page, numbered section cards, the
 * yellow community banner and a short footer.
 */

export type LegalSection = {
  title: string;
  body: ReactNode;
};

export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#090D16] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0A0E17]">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href="/" aria-label="Zero FM home" className="flex shrink-0 items-center">
            <img
              src="/images/zero-fm-logo.png"
              alt="Zero FM Live"
              className="h-auto w-[120px] object-contain sm:w-[136px]"
            />
          </a>

          <a
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.12] px-4 text-sm text-white/80 transition hover:border-[#FFD400]/60 hover:text-[#FFD400]"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-[#0F1523] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/80">
            <span className="size-1.5 rounded-full bg-[#FFD400]" />
            Zero FM.Live
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold uppercase tracking-[-0.02em] sm:text-5xl">
            {title}
          </h1>

          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#64748B]">
            Last updated {updated}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/[0.08] bg-[#0F1523] p-6 transition-colors duration-300 hover:border-white/[0.14] sm:p-8"
            >
              <h2 className="flex items-baseline gap-3 border-b border-white/[0.08] pb-4 font-display text-lg font-bold uppercase sm:text-xl">
                <span className="font-mono text-[#FFD400]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </h2>

              <div className="legal-body mt-5 flex flex-col gap-4 text-sm leading-7 text-[#C3CCD8] sm:text-base sm:leading-7">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-[#FFD400] px-6 py-6 text-center shadow-[0_12px_40px_rgba(255,212,0,0.18)]">
          <p className="font-display text-lg font-bold uppercase text-[#090D16] sm:text-2xl">
            A community service to entertain our nation!
          </p>
        </div>
      </div>

      <footer className="border-t border-white/[0.08] bg-[#070B13]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[#64748B] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} Zero FM Broadcasting Network. All rights reserved.</p>

          <div className="flex gap-5">
            <a href="/privacy-policy" className="transition hover:text-[#FFD400]">
              Privacy Policy
            </a>
            <a href="/terms" className="transition hover:text-[#FFD400]">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
