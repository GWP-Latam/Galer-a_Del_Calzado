import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteChrome } from "@/components/SiteChrome";
import { getPlaza } from "@/lib/content/repository";
import "./globals.css";

// Reserved for the single H1 on each page — see tokens.css.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://galeriadelcalzado.com.mx";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Galería del Calzado — Directorio de marcas en Guadalajara",
    template: "%s — Galería del Calzado",
  },
  description:
    "Directorio de marcas, mapa interactivo, promociones y ubicación de Galería del Calzado, la plaza especializada en calzado en Av. México, Guadalajara.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Galería del Calzado",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const plaza = getPlaza();
  return (
    <html lang="es-MX" data-scroll-behavior="smooth" className={`${bodoni.variable} ${instrument.variable}`}>
      <body className="flex min-h-dvh flex-col bg-paper text-ink antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Saltar al contenido
        </a>
        <SiteChrome plaza={plaza}>{children}</SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
