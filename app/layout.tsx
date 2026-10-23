import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SearchProvider } from '@/components/search';
import { navGroups } from '@/lib/content';
import './globals.css';
import './alumni.css';

export const metadata: Metadata = {
  title: { default: 'UCLA Mathematics — Infinite possibilities.', template: '%s | UCLA Mathematics' },
  description: 'Explore UCLA Mathematics. Find undergraduate and graduate programs, world-class research, our people, department news, and upcoming seminars in one clear, searchable place.',
  icons: { icon: '/brand/ucla-favicon.png', apple: '/brand/ucla-favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth"><body><SearchProvider><a className="skip-link" href="#main">Skip to content</a><Header groups={navGroups}/><main id="main">{children}</main><Footer/></SearchProvider></body></html>;
}
