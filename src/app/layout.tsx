import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import SideNav from "@/components/SideNav";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "BitQuest — เรียนรู้ทีละนิด เก่งขึ้นทุกวัน",
  description: "แพลตฟอร์มเรียนรู้แบบ Microlearning สำหรับคนไทย เปลี่ยนการเรียนให้สนุกเหมือนเล่นเกม",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          <div className="flex flex-col md:flex-row min-h-screen">
            <SideNav />
            <main className="flex-1 md:ml-64 relative w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
