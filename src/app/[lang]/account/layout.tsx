import type { Metadata } from 'next';

// Sayfa istemci bileşeni olduğu için metadata burada verilir: özel sayfa, indekslenmez.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
