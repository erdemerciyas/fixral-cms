'use client';

import { LazyMotion } from 'framer-motion';

// Animasyon motoru (domAnimation) ana bundle dışında, async chunk olarak yüklenir.
// Root layout'a bağlı bileşenler (Header, nav, PageTransitionWrapper) `m` bileşenini
// kullanır; features yüklenene kadar statik render edilir.
const loadFeatures = () =>
  import('./motion-features').then((mod) => mod.default);

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
