import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import splash from "../../assets/splash.jpg";
import SiteNavigation from "@/components/site-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maplestreet",
  description: "A Next.js, React, and TypeScript starter.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="font-sans scheme-light-dark">
      <body className="isolate m-0 min-h-svh bg-[#6d777d] text-[#17212b] dark:text-[#f5f7fa]">
        <div className="pointer-events-none fixed -inset-3 -z-20" aria-hidden="true">
          <Image
            src={splash}
            alt=""
            fill
            sizes="100vw"
            preload
            className="object-cover blur-[6px]"
          />
        </div>
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-white/30 dark:bg-[#0c121a]/40"
          aria-hidden="true"
        />
        <div className="mx-auto w-[calc(100%-2.5rem)] min-w-0 max-w-7xl max-[30rem]:w-[calc(100%-1.5rem)]">
          <SiteNavigation />
          {children}
        </div>
      </body>
    </html>
  );
}
