import type { Metadata } from "next";
import "./globals.css";

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
