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
    <html
      lang="en"
      className={`${serif.variable} ${grotesk.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved color-mode choice before first paint so the page
            never flashes the system default before hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();",
          }}
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
