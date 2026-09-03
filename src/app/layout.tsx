import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

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
  title: "Cãominhada Petsalut 2026 - Celebrando a Saúde e Felicidade Pet",
  description: "Inscreva-se na Cãominhada Petsalut 2026! Um evento incrível para tutores e pets celebrarem a saúde, o bem-estar e a felicidade juntos.",
  keywords: ["Cãominhada", "Petsalut", "evento pet", "saúde animal", "caminhada com cães", "inscrição cãominhada"],
  authors: [{ name: "Petsalut" }],
  openGraph: {
    title: "Cãominhada Petsalut 2026",
    description: "Inscreva-se no maior evento pet do ano! Saúde, bem-estar e diversão para você e seu melhor amigo.",
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
                localStorage.removeItem('theme');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-800 font-sans selection:bg-lime-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
