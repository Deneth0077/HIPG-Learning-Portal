import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HIPG Learning Portal | Hambantota International Port Group",
  description: "Learn, understand and master HIPG operational systems including BTOS, BULK, CTOS, VTMS, Billing, VBS, and EAM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-[#F3F7FC] text-[#142B45] font-sans">
        {children}
      </body>
    </html>
  );
}
