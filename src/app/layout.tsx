import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://modugil.vercel.app"),
  title: "모두의 길 - AI 교통약자 이동 어시스턴트",
  description: "전국 통합개방 데이터(7종)와 AI를 활용한 교통약자 맞춤 이동 지원 서비스. 실시간 신호등, 교통약자 차량, 버스, 도서관, 민원실 정보를 AI가 안내합니다.",
  keywords: ["교통약자", "이동지원", "공공데이터", "AI", "신호등", "전국통합데이터"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "모두의 길 - AI 교통약자 이동 어시스턴트",
    description: "전국 통합개방 데이터와 AI를 활용한 교통약자 맞춤 이동 지원 서비스",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Noto+Serif+KR:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full antialiased">
        {children}
        <Footer />
        <Analytics />
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
