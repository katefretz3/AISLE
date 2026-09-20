import type {CapacitorConfig} from '@capacitor/cli';
const config:CapacitorConfig={appId:'ca.aisle.grocery',appName:'Aisle',webDir:'dist',backgroundColor:'#f7f8f5',ios:{contentInset:'automatic',backgroundColor:'#f7f8f5'},android:{backgroundColor:'#f7f8f5',allowMixedContent:false},plugins:{Camera:{},StatusBar:{style:'DARK',backgroundColor:'#f7f8f5',overlaysWebView:false}}};
export default config;
