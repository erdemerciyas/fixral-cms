import React from 'react';
import { usePWAInstallPrompt, usePWA } from '@/hooks/usePWA';

export default function PWAInstallPrompt() {
  const { showPrompt, handleInstall, dismissPrompt } = usePWAInstallPrompt();

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-card rounded-lg shadow-lg border border-border p-4">
        {/* Close Button */}
        <button
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss install prompt"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* App Icon */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Install Fixral
            </h3>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Add this app to your home screen for quick access and a better experience.
            </p>

            {/* Benefits */}
            <div className="mb-4">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Offline</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.122-2.122m5.656 5.656l2.122-2.122M9 3h1m5 18v1m-9-9H1m15.656-5.656l2.122-2.122" />
                  </svg>
                  <span>Native</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Install
              </button>
              <button
                onClick={dismissPrompt}
                className="flex-1 bg-muted hover:bg-accent text-foreground text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PWA status indicator component
export function PWAStatusIndicator() {
  const { isOnline, isInstalled, updateAvailable, updateServiceWorker } = usePWA();

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground text-xs px-3 py-1 rounded-full mb-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Offline</span>
        </div>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center space-x-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <button onClick={updateServiceWorker} className="hover:underline">
            Update Available
          </button>
        </div>
      )}
    </div>
  );
}
