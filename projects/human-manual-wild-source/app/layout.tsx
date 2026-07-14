import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : undefined;
  return {
    title: { default: "人类说明书（野生版）· 我到底哪根筋", template: "%s · 人类说明书" },
    description: "三轮渐进、动态追问的多维内在探索：从 MBTI 到 Big Five、价值驱动、关系模式、边界与压力恢复。",
    metadataBase: origin ? new URL(origin) : undefined,
    openGraph: { title: "人类说明书（野生版）", description: "你不是四个字母，你是一整套勉强能运行的系统。" },
    twitter: { card: "summary", title: "人类说明书（野生版）", description: "三轮动态追问，越答越像你。" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
