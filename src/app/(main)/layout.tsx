import Footer from "@/components/landing/Footer";
import NavBar from "@/components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="mx-20 bg-[#111212] border-b border-x border-white/20">
        <NavBar />
        {children}
        <Footer/>
      </body>
    </html>
  );
}
