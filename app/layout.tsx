import type { Metadata, Viewport } from "next";
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
  title: {
    default: "Sınav Köyü | YKS 2027",
    template: "%s | Sınav Köyü",
  },

  description:
    "YKS 2027 hazırlık sürecini planla, hedeflerini takip et, konularını yönet, denemelerini kaydet ve gelişimini gör.",

  applicationName: "Sınav Köyü",

  keywords: [
    "Sınav Köyü",
    "YKS",
    "YKS 2027",
    "TYT",
    "AYT",
    "TYT çalışma",
    "AYT çalışma",
    "YKS çalışma programı",
    "ders çalışma",
    "deneme takibi",
    "konu takibi",
    "Pomodoro",
  ],

  authors: [
    {
      name: "Sınav Köyü",
    },
  ],

  creator: "Sınav Köyü",

  robots: {
    index: true,
    follow: true,
  },

  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-white font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}