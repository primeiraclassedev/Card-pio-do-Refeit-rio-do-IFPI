import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/ifpi.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cardápio Refeitório IFPI | Campus Teresina Central',
  description:
    'Confira o cardápio semanal atualizado do refeitório do IFPI – Campus Teresina Central. Veja o horário de funcionamento, almoço e jantar de segunda a sexta-feira.',
  keywords: [
    'cardápio refeitório IFPI',
    'almoço IFPI Teresina Central',
    'janta IFPI',
    'restaurante estudantil IFPI',
  ],
  openGraph: {
    title: 'Cardápio da Semana – Refeitório IFPI (Campus Teresina Central)',
    description:
      'Veja o que será servido hoje no almoço e jantar do refeitório do IFPI Campus Teresina Central.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}