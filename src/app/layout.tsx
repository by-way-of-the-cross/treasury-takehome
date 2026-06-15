import type { Metadata } from "next";
import { IBM_Plex_Mono, Merriweather, Public_Sans } from "next/font/google";
import GovBanner from "@/components/GovBanner";
import "./globals.css";

// Public Sans is the official U.S. government typeface; Merriweather is the
// USWDS serif used for federal headings.
const publicSans = Public_Sans({
  variable: "--font-public",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merri",
  weight: ["700", "900"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-plex",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Label Check — TTB COLA Label Verification (Prototype)",
  description:
    "Prototype: AI-assisted verification of alcohol beverage labels against COLA application data. For testing only; not an official government service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${merriweather.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GovBanner />

        {/* Treasury / TTB masthead */}
        <header className="bg-navy text-white">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <a
              href="https://www.ttb.gov"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Alcohol and Tobacco Tax and Trade Bureau (ttb.gov)"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-gold font-display text-sm font-black tracking-tight text-gold transition hover:bg-gold hover:text-navy"
            >
              TTB
            </a>
            <div className="leading-tight">
              <a
                href="https://www.ttb.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-sm font-bold underline-offset-2 hover:underline sm:text-base"
              >
                Alcohol and Tobacco Tax and Trade Bureau
              </a>
              <br />
              <a
                href="https://home.treasury.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/70 underline-offset-2 transition hover:text-white hover:underline"
              >
                U.S. Department of the Treasury
              </a>
            </div>
            <div className="ml-auto hidden text-right leading-tight sm:block">
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/60">
                COLA
              </p>
              <p className="font-display font-bold">Label Check</p>
            </div>
          </div>
        </header>

        {/* Unmissable disclaimer: this is a prototype, not a real gov service. */}
        <aside
          role="note"
          className="border-y-[3px] border-gold bg-review-bg text-ink"
        >
          <p className="mx-auto max-w-5xl px-4 py-2 text-sm">
            <strong>For testing purposes only.</strong> This is a prototype built
            for a technical exercise. It is <strong>not</strong> an official U.S.
            government website or service, and it makes no real regulatory
            determinations.
          </p>
        </aside>

        {children}
      </body>
    </html>
  );
}
