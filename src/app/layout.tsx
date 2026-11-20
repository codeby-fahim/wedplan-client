import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "WedPlan | Wedding Planning Platform",
    template: "%s | WedPlan",
  },
  description:
    "Plan your dream wedding with WedPlan. Discover trusted wedding vendors, explore services, manage bookings, and make your special day unforgettable.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
