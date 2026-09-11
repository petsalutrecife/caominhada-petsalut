import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Script from "next/script";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import "./globals.css";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-FG7TQ4BCEG";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://caominhadapetsalute.com.br"),
  alternates: {
    canonical: "https://caominhadapetsalute.com.br",
  },
  title: "Cãominhada Pet Salute 2026 - Celebrando a Saúde e Felicidade Pet",
  description: "Inscreva-se na Cãominhada Pet Salute 2026! Um evento incrível para tutores e pets celebrarem a saúde, o bem-estar e a felicidade juntos.",
  keywords: ["Cãominhada", "Pet Salute", "evento pet", "saúde animal", "caminhada com cães", "inscrição cãominhada"],
  authors: [{ name: "Pet Salute" }],
  openGraph: {
    title: "Cãominhada Pet Salute 2026",
    description: "Inscreva-se no maior evento pet do ano! Saúde, bem-estar e diversão para você e seu melhor amigo.",
    url: "https://caominhadapetsalute.com.br",
    siteName: "Cãominhada Pet Salute",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-800 font-sans selection:bg-lime-500 selection:text-slate-950">
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <WhatsAppSupport />
      </body>
    </html>
  );
}
