import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'JL Automotive - Gestão de Orçamentos e Pintura Automotiva',
  description: 'Sistema profissional de orçamentos, financeiro, clientes e agenda para a oficina JL Automotive.',
  openGraph: {
    title: 'JL Automotive - Gestão de Orçamentos e Pintura Automotiva',
    description: 'Sistema profissional de orçamentos, financeiro, clientes e agenda para a oficina JL Automotive.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JL Automotive - Gestão de Orçamentos e Pintura Automotiva',
    description: 'Sistema profissional de orçamentos, financeiro, clientes e agenda para a oficina JL Automotive.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
