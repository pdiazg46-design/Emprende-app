import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atsit.emprende',
  appName: 'Emprende',
  webDir: 'out',
  server: {
    url: 'https://emprende-atsit.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#F4F7F9",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#4379F2"
    }
  }
};

export default config;
