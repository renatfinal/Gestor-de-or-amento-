import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'JM Funilaria - Gestão de Orçamentos e Pintura Automotiva',
  description: 'Sistema profissional de orçamentos, financeiro, clientes e agenda para a oficina JM Funilaria.',
  openGraph: {
    title: 'JM Funilaria - Gestão de Orçamentos e Pintura Automotiva',
    description: 'Sistema profissional de orçamentos, financeiro, clientes e agenda para a oficina JM Funilaria.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JM Funilaria - Gestão de Orçamentos e Pintura Automotiva',
    description: 'Sistema profissional de orçamentos, financeiro, clientes e agenda para a oficina JM Funilaria.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
