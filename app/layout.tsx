import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bad UI Olympics',
  description:
    'Six terrible interfaces. One stopwatch. Race through the Bad UI Olympics and share your score.',
  applicationName: 'Bad UI Olympics',
  icons: { icon: '/logo.svg' },
  openGraph: {
    title: 'Bad UI Olympics',
    description: 'Six events. Zero usability. Can you beat the interface?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Bad UI Olympics',
    description: 'Six events. Zero usability. Can you beat the interface?',
  },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#d7ff3f' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
