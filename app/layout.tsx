import type { Metadata } from 'next';
import './globals.css';
import './grouped-nav.css';

export const metadata: Metadata = {
  title: 'Choroni West Arts Grant',
  description: 'Small grants for emerging artists and creative producers ready to make something real.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
