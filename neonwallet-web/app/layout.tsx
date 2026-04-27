import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeonWallet — Mobile Money Tracker',
  description: 'Track your MoMo transactions, monitor finances, analyze spending. Built for Ghana.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-900 text-white antialiased font-body">
        {children}
      </body>
    </html>
  );
}
