import type { Metadata } from "next";
import "./globals.css";

// Temporarily disabled due to network restrictions
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "André Finances",
  description: "Personal finance management app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-slate-50">
          {children}
        </div>
      </body>
    </html>
  );
}
