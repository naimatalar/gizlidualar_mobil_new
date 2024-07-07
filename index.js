import { registerRootComponent } from 'expo';


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


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
// AppRegistry.registerComponent('main', () => App)