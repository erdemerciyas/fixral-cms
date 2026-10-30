'use client';

/**
 * Rota değişiminde üstte 2px turuncu ilerleme çubuğu (redesign 2026).
 * Genişlik inline stil yerine `data-p` adımlarıyla (fx-contact.css) verilir;
 * hareket azaltma tercihinde yalnızca görünürlük değişir.
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const STEPS = [
  { delay: 100, value: 35 },
  { delay: 300, value: 55 },
  { delay: 600, value: 75 },
  { delay: 1000, value: 85 },
];

export default function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Ertelenmiş başlatma: efekt gövdesinde senkron setState yerine bir sonraki tick
    const startTimer = setTimeout(() => {
      setLoading(true);
      setProgress(15);
    }, 0);
    const timers = STEPS.map((step) => setTimeout(() => setProgress(step.value), step.delay));
    let endTimer: ReturnType<typeof setTimeout> | undefined;
    const completeTimer = setTimeout(() => {
      setProgress(100);
      endTimer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }, 1200);

    return () => {
      clearTimeout(startTimer);
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
      if (endTimer) clearTimeout(endTimer);
    };
  }, [pathname]);

  return (
    <div className={`fx-loadbar ${loading ? 'is-active' : ''}`} aria-hidden="true">
      <div className="fx-loadbar__fill" data-p={progress} />
    </div>
  );
}
