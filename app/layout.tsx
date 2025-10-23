import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarineFlux - Maritime Industry Digital Marketplace",
  description: "The trusted platform bringing ship owners and suppliers together",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



