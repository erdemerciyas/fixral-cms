'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

/**
 * Admin paneli tema sağlayıcısı.
 * - `storageKey`: public taraftaki eski `theme` anahtarıyla çakışmaması için ayrık.
 * - `disableTransitionOnChange`: tema geçişinde renk animasyonu karmaşasını önler.
 */
export function AdminThemeProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="fixral-admin-theme"
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}
