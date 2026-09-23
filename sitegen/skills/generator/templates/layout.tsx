import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "{{META_TITLE}}",
  description: "{{META_DESCRIPTION}}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SmoothScroll>
          <Header navItems={[]} />
          <main>{children}</main>
          <Footer email="" phone="" address="" socials={[]} />
        </SmoothScroll>
      </body>
    </html>
  );
}
