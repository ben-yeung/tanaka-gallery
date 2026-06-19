import type { Metadata } from "next";
import { serif, grotesk, sans } from "./fonts";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Tanaka's Gallery", template: "%s — Tanaka's Gallery" },
  description: "Art. Objects. San Francisco.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${grotesk.variable} ${sans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
