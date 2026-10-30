'use client';

import FxRouteLoader from './fx/FxRouteLoader';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

/**
 * Rota geçişi FxRouteLoader perdesiyle yapılır (FX okları kapanır → yeni sayfa
 * commit → açılır). Eski AnimatePresence solması, perde açılırken eski sayfayı
 * gösterdiği için kaldırıldı.
 */
export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  return (
    <>
      <div className="relative">{children}</div>
      <FxRouteLoader />
    </>
  );
}
