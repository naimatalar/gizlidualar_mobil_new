import React, { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiConstant from './src/helpers/dataApi/apiConstant'

import { GetAxios } from './src/helpers/dataApi/crud'
import Index from './src/screens'
import { Platform, View, Text, StyleSheet } from 'react-native'
import Pressability from 'react-native/Libraries/Pressability/Pressability'
import Loading from './src/components/Loading'
import './src/polyfills/backHandlerFix'
import { navigate } from './src/navigation/navigationRef'
import { Audio } from 'expo-av'
import * as Notifications from 'expo-notifications'
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads'
import AdMobBanner from './src/components/ads/AdMobBanner'
import Purchases from 'react-native-purchases'

const APIKeys = {
  apple: 'appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX',
  google: 'goog_OfndwmvoPjhIPGFfcHLzfGuYPIR',
}
// import { getLocales } from 'expo-localization';
// import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// "expo-dev-client": "^2.4.11",

const AD_OVERLAY_COOLDOWN_MS = 4 * 60 * 1000
const AD_OVERLAY_STORAGE_KEY = 'ad_overlay_next_allowed_at'

const wrapPressabilityConfig = (config) => {
  if (!config || typeof config.onPress !== 'function') {
    return config
  }
  if (config.onPress.__adOverlayWrapped) {
    return config
  }  
  console.log("config", config)
  if (config.delayLongPress) { 
    console.log("delayLongPress var")
    return config
  }   
  else{
    console.log("delayLongPress yok")
  }
  const originalOnPress = config.onPress
  const wrappedOnPress = (...args) => {
    try {

      globalThis.__TRIGGER_AD_OVERLAY?.()
    } catch (error) {
      console.warn('Ad overlay trigger error', error)
    }
    return originalOnPress(...args)
  }
  wrappedOnPress.__adOverlayWrapped = true
  return {
    ...config,
    onPress: wrappedOnPress,
  }
}

if (!Pressability.prototype.configure.__pressAlertWrapped) {
  const originalConfigure = Pressability.prototype.configure
  Pressability.prototype.configure = function patchedConfigure(config) {
    return originalConfigure.call(this, wrapPressabilityConfig(config))
  }
  Pressability.prototype.configure.__pressAlertWrapped = true
}

//  LogBox.ignoreAllLogs()
export default function App() {
  const [isLogin, setIsLogin] = useState(null)
  const [data, setData] = useState()
  const [refresh, setRefresh] = useState(true)
  const [adOverlayVisible, setAdOverlayVisible] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    }).catch((err) => console.warn('Audio mode error', err))
  }, [])

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('playback', {
        name: 'Playback',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        vibrationPattern: [0],
        enableLights: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      }).catch((err) => console.warn('Playback channel error', err))

      Notifications.requestPermissionsAsync().catch((err) =>
        console.warn('Notification permission request failed', err)
      )
    }
  }, [])

  useEffect(() => {
    mobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      })
      .then(() => mobileAds().initialize())
      .catch((err) => console.warn('MobileAds init error', err))
  }, [])

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey: APIKeys.google })
        } else {
          await Purchases.configure({ apiKey: APIKeys.apple })
        }

        const customerInfo = await Purchases.getCustomerInfo()
        
        // Detaylı loglama
        console.log('[Subscription Check] CustomerInfo:', JSON.stringify(customerInfo, null, 2))
        console.log('[Subscription Check] Active entitlements keys:', Object.keys(customerInfo.entitlements.active || {}))
        console.log('[Subscription Check] All entitlements keys:', Object.keys(customerInfo.entitlements.all || {}))
        
        const reklamsizEntitlement = customerInfo.entitlements.active['naim1016']
        const isActive = reklamsizEntitlement !== undefined
        
        console.log('[Subscription Check] naim1016 entitlement:', reklamsizEntitlement)
        console.log('[Subscription Check] isActive:', isActive)
        
        setHasSubscription(isActive)
        
        if (isActive) {
          console.log('[Subscription Check] abonesin')
        } else {
          console.log('[Subscription Check] değilsin')
        }
      } catch (error) {
        console.warn('Subscription check error in App.js', error)
        setHasSubscription(false)
      }
    }

    checkSubscription()

    // AppState listener kaldırıldı - sadece uygulama açılışında kontrol ediliyor
  }, [])

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response?.notification) {
          navigate('OzelAlanim')
        }
      })
      .catch((err) => console.warn('getLastNotificationResponseAsync error', err))

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
      navigate('OzelAlanim')
    })

    return () => {
      responseSubscription.remove()
    }
  }, [])

  const showAdOverlay = useCallback(() => {
    setAdOverlayVisible((prev) => (prev ? prev : true))
  }, [])

  const dismissAdOverlay = useCallback(() => {
    setAdOverlayVisible(false)
  }, [])

  const triggerAdOverlay = useCallback(async () => {
    // Abone ise reklam gösterme
    if (hasSubscription) {
      return
    }

    if (adOverlayVisible) {
      return
    }
    try {
      const stored = await AsyncStorage.getItem(AD_OVERLAY_STORAGE_KEY)
      const nextAllowed = stored ? parseInt(stored, 10) : 0
      const now = Date.now()
      if (nextAllowed && now < nextAllowed) {
        return
      }
      await AsyncStorage.setItem(
        AD_OVERLAY_STORAGE_KEY,
        String(now + AD_OVERLAY_COOLDOWN_MS)
      )
    } catch (error) {
      console.warn('Ad overlay cooldown error', error)
    }
    showAdOverlay()
  }, [adOverlayVisible, showAdOverlay, hasSubscription])

  useEffect(() => {
    globalThis.__TRIGGER_AD_OVERLAY = triggerAdOverlay
    return () => {
      if (globalThis.__TRIGGER_AD_OVERLAY === triggerAdOverlay) {
        globalThis.__TRIGGER_AD_OVERLAY = undefined
      }
    }
  }, [triggerAdOverlay])

  useEffect(() => {
    globalThis.__START_APP = start
    return () => {
      if (globalThis.__START_APP === start) {
        globalThis.__START_APP = undefined
      }
    }
  }, [])

  useEffect(() => {
    // (async () => {
    //   const { status } = await requestTrackingPermissionsAsync();
    //   if (status === 'granted') {
    //     console.log('Yay! I have user permission to track data');
    //   }
    // })();
    try {
    

      
      start()

    } catch (error) {
      throw error
    }


  }, [])


  const start = async () => { 
    setRefresh(true)
    // var lcl=getLocales();
    
    // await AsyncStorage.setItem("lang-duaap",lcl[0].languageCode=="tr"?"tr":"ar")

    //  var sads=await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x }); //////Silinecek

    var tkn = await AsyncStorage.getItem("hlcapptokengDua").then(x => { return x })

    setTimeout(() => {
      setRefresh(false)

    }, 1000);





  }
 
  const renderAdOverlay = () => {
    // Abone ise reklam gösterme
    if (hasSubscription || !adOverlayVisible) {
      return null
    }
    return (
      <View style={styles.adOverlayBackdrop} pointerEvents="auto">
        <View style={styles.adOverlayCard}>
          <AdMobBanner
            variant="interstitial"
            iosAdUnitId="ca-app-pub-8795169628743262/5924254442"
            androidAdUnitId="ca-app-pub-8795169628743262/7813827283"
            showOnMount
           
            onAdFailedToLoad={dismissAdOverlay}
            onInterstitialClosed={dismissAdOverlay}
          />
        </View>
      </View>
    )
  }
 
  if (refresh == true) {
    return (
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Loading width={80} />
        {renderAdOverlay()}
      </View>
    )
  } else {
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <Index startBase={start} />
        {renderAdOverlay()}
      </View>
    )
  }
}


//  export JAVA_HOME=$(/usr/libexec/java_home -v 17)

const styles = StyleSheet.create({
  adOverlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  adOverlayCard: {
    width: '90%',
    maxWidth: 360,
  },
  overlayAdPlaceholder: {
    width: '100%',
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPlaceholderText: {
    color: '#CFD8DC',
    fontSize: 14,
  },
})