import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { LANGUAGE_COOKIE, isSiteLanguage } from "@/src/i18n/language-cookie";
import { LiveRadioProvider } from "./components/LiveRadio";

const spaceGrotesk = Space_Grotesk({
  weight: "variable",
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  weight: "variable",
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  weight: "variable",
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zero FM | Good Music. Brighter Days.",
  description: "Sri Lanka's digital music community.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Send the page in the visitor's saved language, so a refresh never
  // shows English first
  const saved = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  const language = isSiteLanguage(saved) ? saved : "english";
  const htmlLang = language === "sinhala" ? "si" : language === "tamil" ? "ta" : "en";

  return (
    <html
      lang={htmlLang}
      data-site-language={language}
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Kavivanar&family=Abhaya+Libre:wght@400;500;600;700;800&family=Tilt+Neon&family=Arimo:wght@400;500;600;700&family=Caveat+Brush&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col font-body"
        data-site-language={language}
      >
        <LanguageProvider initialLanguage={language}>
          {/* The live radio sits here so it keeps playing on every page */}
          <LiveRadioProvider>{children}</LiveRadioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
