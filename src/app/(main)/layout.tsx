// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className=" mx-20 bg-[#111212]    border-b border-x  border-white/20">
        
        
        {children}</body>
    </html>
  );
}
