import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailywhisper.app',
  appName: '每日一语',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
};

export default config;
