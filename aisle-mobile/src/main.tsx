// The shared stylesheet loads first, so each component's own stylesheet can
// refine it without fighting the cascade. The display face is imported here,
// not from CSS: inlined into globals.css its font files would not resolve.
import '@fontsource-variable/fraunces/opsz.css';
import './app/globals.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Capacitor} from '@capacitor/core';
import {App} from '@capacitor/app';
import {StatusBar} from '@capacitor/status-bar';
import {applyTheme, readAppearance, resolveTheme} from './lib/appearance';
import {installSheetGesture} from './lib/sheet-gesture';
import AisleApp from './app/aisle-app';
import ErrorBoundary from './components/error-boundary';
applyTheme(resolveTheme(readAppearance()));
installSheetGesture();
if (Capacitor.isNativePlatform()) {
  document.body.classList.add('is-native');
  void StatusBar.setOverlaysWebView({overlay: false}).catch(() => {});
  // Let the first back action close an open sheet/dialog before leaving a screen.
  void App.addListener('backButton', () => {
    const modal = document.querySelector(
      '[role="dialog"][data-state="open"],[role="alertdialog"][data-state="open"]',
    );
    if (modal) {
      const close = modal.querySelector<HTMLButtonElement>(
        '[data-slot="dialog-close"],[data-slot="sheet-close"]',
      );
      if (close) close.click();
      else document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
      return;
    }
    if (location.hash && location.hash !== '#home') {
      location.hash = '#home';
      return;
    }
    void App.minimizeApp();
  });
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AisleApp />
    </ErrorBoundary>
  </React.StrictMode>,
);
