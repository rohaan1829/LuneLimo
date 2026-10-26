import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/lib/content";
import "./globals.css";

// The two faces in the Lune Limo lockup: Cormorant Garamond for the wordmark, Inter for the line beneath.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Lune Limo | Private chauffeur, day and night",
    template: "%s | Lune Limo",
  },
  description:
    "Private chauffeurs in black Cadillac Escalades. Airport transfers, corporate travel, weddings and late nights, booked at a fixed fare.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
