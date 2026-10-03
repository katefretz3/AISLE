import type {CapacitorConfig} from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'ca.aisle.grocery',
  appName: 'Aisle',
  webDir: 'dist',
  backgroundColor: '#f4f1ea',
  ios: {contentInset: 'automatic', backgroundColor: '#f4f1ea'},
  android: {backgroundColor: '#f4f1ea', allowMixedContent: false},
  plugins: {
    Camera: {},
    StatusBar: {style: 'DARK', backgroundColor: '#f4f1ea', overlaysWebView: false},
  },
};
export default config;
