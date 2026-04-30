import type { Metadata } from "next";
import { Sarabun, Prompt } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";

const sarabun = Sarabun({
  variable: "--font-heading",
  subsets: ["latin", "thai"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-body",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "โรงเรียนสอยดาววิทยา | Soidao Wittaya School",
  description: "Smart Minds | Strong Bodies | Real-World Skills — โรงเรียนมัธยมศึกษา อำเภอสอยดาว จังหวัดจันทบุรี",
  keywords: ["สอยดาววิทยา", "โรงเรียนสอยดาว", "Soidao Wittaya", "จันทบุรี", "มัธยม"],
  icons: {
    icon: "/favicon.webp",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="th">
      <body className={`${sarabun.variable} ${prompt.variable} antialiased`}>
        <Navbar session={session ? { 
          name: session.name, 
          role: session.role,
          isAdmin: session.isAdmin,
          hasManagementAccess: session.hasManagementAccess
        } : null} />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
