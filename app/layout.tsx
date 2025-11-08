import "./globals.css";
import { Inter } from "next/font/google";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { SkipLink } from "./components/SkipLink";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "WCAGAI - AI-Powered Accessibility Testing",
  description: "Intelligent accessibility testing platform combining AI analysis with WCAG compliance checking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <SkipLink />
        <Navigation />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}