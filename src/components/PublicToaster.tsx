'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { CloseIcon } from '@/components/fx/FxIcons';

// Public site için tek toast sistemi (sonner). Görünüm marka token'larından gelir:
// sonner'ın kendi stilleri kapalı (unstyled), sınıflar fx-contact.css'te.
// Admin tarafı kendi Toaster'ını admin layout'ta mount ettiğinden
// çifte bildirim olmaması için /admin altında render edilmez.
export default function PublicToaster() {
  const pathname = usePathname() || '';
  const { t } = useAppTranslations('fx');
  if (pathname.startsWith('/admin')) return null;
  return (
    <Toaster
      position="top-right"
      offset={{ top: 80, right: 16 }}
      mobileOffset={{ top: 76, left: 16, right: 16 }}
      closeButton
      gap={10}
      icons={{ close: <CloseIcon /> }}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: t('nav.close'),
        classNames: {
          toast: 'fx-toast',
          title: 'fx-toast__title',
          description: 'fx-toast__desc',
          closeButton: 'fx-toast__close',
          actionButton: 'fx-toast__btn fx-toast__btn--primary',
          cancelButton: 'fx-toast__btn',
        },
      }}
    />
  );
}
