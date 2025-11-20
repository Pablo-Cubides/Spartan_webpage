// app/layout.tsx
import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Inter, Noto_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-noto-sans' });

export const metadata = {
  title: 'Spartan Edge',
  description: 'Forjando hombres, moldeando destinos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${notoSans.variable}`}>
      <body
        className="relative flex size-full min-h-screen flex-col bg-[#141414] text-white font-sans overflow-x-hidden"
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
