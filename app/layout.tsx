// app/layout.tsx
import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "sonner"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

// Opcional: defina NEXT_PUBLIC_SITE_URL no .env (ex.: https://seu-dominio)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#90F209",
  colorScheme: "dark",
}

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: "Figtor — Converter Figma em JSON para Elementor",
    template: "%s | Figtor",
  },
  description:
    "A Figtor converte arquivos do Figma em JSON otimizado para Elementor, acelerando a construção de páginas no WordPress com fidelidade de design.",
  applicationName: "Figtor",
  keywords: [
    "Figtor",
    "Figma para JSON",
    "Figma para Elementor",
    "Converter Figma",
    "Elementor JSON",
    "WordPress",
    "Automação de front-end",
    "Design to code",
  ],
  category: "Ferramentas de design",
  authors: [{ name: "Figtor" }],
  creator: "Figtor",
  publisher: "Figtor",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Figtor",
    title: "Figtor — Converter Figma em JSON para Elementor",
    description:
      "Converta layouts do Figma em JSON pronto para Elementor e lance páginas no WordPress muito mais rápido.",
    url: "/",
    images: [
      {
        url: "/og/figtor-og.png",
        width: 1200,
        height: 630,
        alt: "Figtor — Figma para JSON (Elementor)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Figtor — Figma em JSON para Elementor",
    description:
      "Do Figma ao Elementor em minutos. Gere JSON fiel ao design e acelere seu fluxo WordPress.",
    images: ["/og/figtor-og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  themeColor: "#DA45AD",
  other: {
    "msapplication-TileColor": "#DA45AD",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Figtor",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "Plataforma que converte Figma em JSON pronto para Elementor, acelerando a entrega de páginas no WordPress.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    url: SITE_URL || undefined,
  }

  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased ${inter.className}`}>
        <Providers>
          {children}
          <Analytics />
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#000000",
                color: "#ffffff",
                border: "1px solid #262626",
              },
            }}
          />
        </Providers>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
