import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/ifpi.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://refeitoriodoifpi.vercel.app/'),
  title: 'Cardápio Semanal – Refeitório IFPI Campus Teresina Central',
  description:
    'Confira o cardápio hoje no almoço e jantar do refeitório do IFPI Campus Teresina Central',
  keywords: [
    'cardápio refeitório IFPI',
    'almoço IFPI Teresina Central',
    'janta IFPI',
    'restaurante estudantil IFPI',
  ],
  verification: {
    google: 'ke2QaduEXzNwkUWWeBkWdTh0-ya9e6Oetc4Hmac4Ods',
  },
  openGraph: {
    title: 'Cardápio Semanal – Refeitório IFPI Campus Teresina Central',
    description:
      'Confira o cardápio hoje no almoço e jantar do refeitório do IFPI Campus Teresina Central',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/banner_refeitorio.png', // Nome do arquivo salvo dentro da pasta public/
        width: 1200,
        height: 630,
        alt: 'Cardápio Refeitório IFPI – Campus Teresina Central',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cardápio Semanal – Refeitório IFPI Campus Teresina Central',
    description:
      'Confira o cardápio hoje no almoço e jantar do refeitório do IFPI Campus Teresina Central',
    images: ['/banner_refeitorio.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}