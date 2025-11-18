import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';

import App from './App';
import { I18nManager } from 'react-native';
import { DeviceLanguage } from './src/components/Language';
if (DeviceLanguage == "ar") {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
} else {
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
}


// export ANDROID_HOME=/Users/kycas/Library/Android/sdk
// export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools
// export JAVA_HOME=$(/usr/libexec/java_home -v17)
// java -version
// java version "17.0.x" olmalı

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
TrackPlayer.registerPlaybackService(() => require('./src/player/trackPlayerService').default);
// AppRegistry.registerComponent('main', () => App)