import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { person } from "@/content/portfolio";
import Providers from "@/components/Providers";
import SiteChrome from "@/components/SiteChrome";
import EasterEggs from "@/components/EasterEggs";
import "./globals.css";
import "./scenes.css";
import "./work-index.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const name = `${person.first} ${person.last}`;

export const metadata: Metadata = {
  title: `${name} · ${person.role}`,
  description: person.pitch,
  authors: [{ name }],
  openGraph: {
    title: `${name} · ${person.role}`,
    description: person.pitch,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e4dcc9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* On a full page load of home (refresh / direct entry) → mark <html>
            so the intro plays. This inline script does NOT run on client-side
            navigation, so returning from a sub-page won't replay it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==='/'){document.documentElement.classList.add('intro-first');setTimeout(function(){document.documentElement.classList.remove('intro-first')},5500);}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>
          <SiteChrome />
          {children}
          <EasterEggs />
        </Providers>
      </body>
    </html>
  );
}
