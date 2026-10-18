import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import site from "@/data/site.json";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: site.metadata.title,
  description: site.metadata.description,
  keywords: site.metadata.keywords,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${robotoSlab.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
