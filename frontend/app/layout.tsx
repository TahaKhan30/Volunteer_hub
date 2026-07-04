import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@tabler/icons-webfont/dist/tabler-icons.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JWT Auth Starter",
  description: "FastAPI + Next.js JWT auth with HttpOnly cookies",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
