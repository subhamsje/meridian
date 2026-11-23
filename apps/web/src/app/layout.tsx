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
    <html lang="en" className="dark h-full">
      <body className="bg-[#111315] text-[#e5e7eb] font-sans antialiased h-full selection:bg-[#20242a] selection:text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}
