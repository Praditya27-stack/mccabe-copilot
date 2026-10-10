import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mccabe-copilot.vercel.app'),
  title: {
    default: "McCabe-Thiele Distillation Simulator | AI Co-Pilot & SCADA",
    template: "%s | McCabe-Thiele AI",
  },
  description: "Industrial-grade interactive McCabe-Thiele distillation simulator for Ethanol-Water binary separation with real-time SCADA column visualization and an autonomous LLM Chemical Engineering Co-Pilot.",
  keywords: ["McCabe-Thiele", "Distillation Simulator", "Chemical Engineering", "Ethanol Water Separation", "Thermodynamics", "VLE", "Process Engineering", "Next.js", "AI Co-Pilot", "SCADA"],
  authors: [{ name: "Abyan Praditya", url: "https://github.com/Praditya27-stack" }],
  creator: "Abyan Praditya",
  openGraph: {
    title: "McCabe-Thiele Distillation Simulator | AI Co-Pilot & SCADA",
    description: "Interactive real-time binary distillation simulation powered by Perry's Handbook VLE, dynamic SCADA column tower, and an LLM Co-Pilot.",
    url: "https://mccabe-copilot.vercel.app",
    siteName: "McCabe-Thiele AI Simulator",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "McCabe-Thiele Distillation Simulator | AI Co-Pilot & SCADA",
    description: "Interactive real-time binary distillation simulation powered by Perry's Handbook VLE, dynamic SCADA column tower, and an LLM Co-Pilot.",
    creator: "@Praditya27",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}
