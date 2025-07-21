import './globals.css';
import { inter, zcoolXiaoWei } from './fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Erica的孕期饮食助手',
  description: '为准父母提供科学、安全、美味的孕期饮食建议，缓解饮食焦虑',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${zcoolXiaoWei.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  );
}
