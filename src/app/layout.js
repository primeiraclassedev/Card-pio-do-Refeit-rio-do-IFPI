import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/ifpi.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://refeitoriodoifpi.vercel.app'),
  applicationName: 'Cardápio Refeitório IFPI',
  title: 'Cardápio Semanal – Refeitório IFPI Campus Teresina Central',
  description:
    'Confira o cardápio atualizado do almoço e jantar no refeitório estudantil do IFPI Campus Teresina Central.',
  keywords: [
    'cardápio refeitório IFPI',
    'cardápio IFPI Teresina Central',
    'almoço IFPI Teresina Central',
    'jantar IFPI Teresina',
    'restaurante estudantil IFPI',
    'refeitório IFPI hoje',
  ],
  category: 'Education',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  authors: [
    {
      name: 'Johny William Pereira de Sousa',
      url: 'https://primeiraclasse.dev.br/#johny-william',
    },
    {
      name: 'Kaleo Cordeiro de Abreu',
      url: 'https://primeiraclasse.dev.br/#kaleo-cordeiro',
    },
    {
      name: 'Roberto Carlos Cavalcante Lima Filho',
      url: 'https://primeiraclasse.dev.br/#roberto-carlos',
    },
    {
      name: 'Sara Juliana Lima Ferreira',
      url: 'https://primeiraclasse.dev.br/#sara-juliana',
    },
    {
      name: 'Primeira Classe',
      url: 'https://primeiraclasse.dev.br',
    },
  ],
  creator: 'Primeira Classe',
  publisher: 'Primeira Classe',
  verification: {
    google: 'ke2QaduEXzNwkUWWeBkWdTh0-ya9e6Oetc4Hmac4Ods',
  },
  openGraph: {
    title: 'Cardápio Semanal – Refeitório IFPI Campus Teresina Central',
    description:
      'Confira o cardápio atualizado do almoço e jantar no refeitório estudantil do IFPI Campus Teresina Central.',
    url: 'https://refeitoriodoifpi.vercel.app',
    siteName: 'Cardápio Refeitório IFPI',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/banner_refeitorio.png',
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
      'Confira o cardápio atualizado do almoço e jantar no refeitório estudantil do IFPI Campus Teresina Central.',
    images: ['/banner_refeitorio.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Cardápio Semanal – Refeitório IFPI Campus Teresina Central',
  url: 'https://refeitoriodoifpi.vercel.app',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'All',
  inLanguage: 'pt-BR',
  description:
    'Plataforma web para consulta rápida do cardápio semanal de almoço e jantar do refeitório do Instituto Federal do Piauí (IFPI) – Campus Teresina Central.',
  about: {
    '@type': 'EducationalOrganization',
    name: 'Instituto Federal do Piauí - Campus Teresina Central',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Teresina',
      addressRegion: 'PI',
      addressCountry: 'BR',
    },
  },
  creator: {
    '@type': 'Organization',
    name: 'Primeira Classe',
    url: 'https://primeiraclasse.dev.br',
    member: [
      { '@type': 'Person', name: 'Johny William Pereira de Sousa' },
      { '@type': 'Person', name: 'Kaleo Cordeiro de Abreu' },
      { '@type': 'Person', name: 'Roberto Carlos Cavalcante Lima Filho' },
      { '@type': 'Person', name: 'Sara Juliana Lima Ferreira' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}