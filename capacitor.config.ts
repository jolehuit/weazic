import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whiteshrt.weazic',
  appName: 'weazic',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
