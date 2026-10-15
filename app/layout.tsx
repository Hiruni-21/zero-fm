import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { LANGUAGE_COOKIE, isSiteLanguage } from "@/src/i18n/language-cookie";
import { LiveRadioProvider } from "./components/LiveRadio";

// English fonts: Playfair Display for headings, Inter for everything else
const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const textFont = Inter({
  variable: "--font-text",
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
      className={`${headingFont.variable} ${textFont.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Kavivanar&family=Abhaya+Libre:wght@400;500;600;700;800&display=swap"
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
