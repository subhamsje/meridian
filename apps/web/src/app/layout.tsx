import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MERIDIAN — Enterprise Company Intelligence & Investigation Platform",
  description: "Understand the company behind the numbers. Independent corporate intelligence, adversarial research, and evidence in every conclusion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0d10] text-[#e1e4ea] font-sans antialiased min-h-screen selection:bg-emerald-900 selection:text-emerald-100">
        {children}
      </body>
    </html>
  );
}
