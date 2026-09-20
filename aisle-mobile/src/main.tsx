import React from 'react';
import {createRoot} from 'react-dom/client';
import {Capacitor} from '@capacitor/core';
import {App} from '@capacitor/app';
import {StatusBar,Style} from '@capacitor/status-bar';
import AisleApp from './app/aisle-app';
import './app/globals.css';
if(Capacitor.isNativePlatform()){
 document.body.classList.add('is-native');
 void StatusBar.setStyle({style:Style.Dark}).catch(()=>{});
 void StatusBar.setOverlaysWebView({overlay:false}).catch(()=>{});
 // Let the first back action close an open sheet/dialog before leaving a screen.
 void App.addListener('backButton',()=>{
  const modal=document.querySelector('[role="dialog"][data-state="open"],[role="alertdialog"][data-state="open"]');
  if(modal){const close=modal.querySelector<HTMLButtonElement>('[data-slot="dialog-close"],[data-slot="sheet-close"]');if(close)close.click();else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return;}
  if(location.hash&&location.hash!=='#home'){location.hash='#home';return;}
  void App.minimizeApp();
 });
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><AisleApp/></React.StrictMode>);
