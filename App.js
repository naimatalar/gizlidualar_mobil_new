import React, { useEffect, useState, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiConstant from './src/helpers/dataApi/apiConstant'

import { GetAxios } from './src/helpers/dataApi/crud'
import Index from './src/screens'
import { Platform, View, Text, StyleSheet, AppState } from 'react-native'
import Pressability from 'react-native/Libraries/Pressability/Pressability'
import Loading from './src/components/Loading'
import './src/polyfills/backHandlerFix'
import { navigate } from './src/navigation/navigationRef'
import { Audio } from 'expo-av'
import * as Notifications from 'expo-notifications'
import mobileAds, { MaxAdContentRating, InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads'
import Purchases from 'react-native-purchases'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import * as Device from 'expo-device'
import * as Application from 'expo-application'

const APIKeys = {
  apple: 'appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX',
  google: 'goog_OfndwmvoPjhIPGFfcHLzfGuYPIR',
}

// UUID v4 generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// AsyncStorage'dan deviceId al veya oluştur
const getOrCreateDeviceId = async () => {
  const STORAGE_KEY = 'deviceId_uuid'
  try {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEY)
    if (!deviceId || deviceId.trim() === '') {
      deviceId = generateUUID()
      await AsyncStorage.setItem(STORAGE_KEY, deviceId)
      console.log('[DeviceId] Yeni UUID oluşturuldu:', deviceId)
    } else {
      console.log('[DeviceId] Mevcut UUID kullanıldı:', deviceId)
    }
    return deviceId
  } catch (error) {
    console.warn('[DeviceId] AsyncStorage hatası:', error)
    // Hata durumunda geçici UUID oluştur
    return generateUUID()
  }
}
// import { getLocales } from 'expo-localization';
// import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// "expo-dev-client": "^2.4.11",

const AD_OVERLAY_COOLDOWN_MS = 5 * 60 * 1000
const AD_OVERLAY_STORAGE_KEY = 'ad_overlay_next_allowed_at'
   
const wrapPressabilityConfig = (config) => {
  if (!config || typeof config.onPress !== 'function') {
    return config
  }
  if (config.onPress.__adOverlayWrapped) {
    return config
  }  
  if (config.delayLongPress) { 
    return config
  }
  const originalOnPress = config.onPress
  const wrappedOnPress = (...args) => {
    try {

      //globalThis.__TRIGGER_AD_OVERLAY?.()
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
  const [hasSubscription, setHasSubscription] = useState(false)
  const signalRConnectionRef = useRef(null)
  const isInitializingRef = useRef(false)
  const hasStartedRef = useRef(false)
  useEffect(() => {
    globalThis.__SET_SUBSCRIPTION = (value) => {
      setHasSubscription(!!value)
    }
    return () => {
      delete globalThis.__SET_SUBSCRIPTION
    }
  }, [])
  const interstitialRef = useRef(null)

useEffect(() => {
  const getToken = async () => {
    var token = await GetAxios(apiConstant.BaseUrl + "/api/backgroundplaystatus/control").then(x => { return x }).catch(x => { return false })
 
    await AsyncStorage.setItem("backgroundPlay", token.data.toString())
  }
  getToken()

}, [])

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
   globalThis.__IS_SUBSCRIBED = !!hasSubscription
   return () => {
     if (globalThis.__IS_SUBSCRIBED !== undefined) {
       globalThis.__IS_SUBSCRIBED = false
     }
   }
 }, [hasSubscription])

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

  // Interstitial reklam yükleme ve yönetimi
  const loadInterstitial = useCallback(() => {
    if (hasSubscription) {
      return
    }

    const iosAdUnitId = 'ca-app-pub-8795169628743262/5924254442'
    const androidAdUnitId = 'ca-app-pub-8795169628743262/7813827283'
    const adUnitId = Platform.OS === 'ios' ? iosAdUnitId : androidAdUnitId

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    })

    const subscriptions = [
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        // Reklam yüklendi, hazır
      }),
      interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('AdMob Interstitial error', error)
      }),
      interstitial.addAdEventListener(AdEventType.CLOSED, async () => {
        // Reklam kapandı, cooldown'u şimdi set et (tam 5 dakika)
        try {
          const now = Date.now()
          await AsyncStorage.setItem(
            AD_OVERLAY_STORAGE_KEY,
            String(now + AD_OVERLAY_COOLDOWN_MS)
          )
        } catch (error) {
          console.warn('Ad overlay cooldown set error', error)
        }
        // Yeni reklam yükle
        loadInterstitial()
      }),
    ]

    interstitial.load()
    interstitialRef.current = interstitial

    return () => {
      subscriptions.forEach((unsubscribe) => {
        try {
          unsubscribe?.()
        } catch (error) {
          console.warn('Interstitial cleanup error', error)
        }
      })
    }
  }, [hasSubscription])

  useEffect(() => {
    const cleanup = loadInterstitial()
    return cleanup
  }, [loadInterstitial])

  const triggerAdOverlay = useCallback(async () => {
    // Abone ise reklam gösterme
    if (hasSubscription) {
      return
    }

    if (!interstitialRef.current) {
      return
    }

    // Cooldown kontrolü
    try {
      const stored = await AsyncStorage.getItem(AD_OVERLAY_STORAGE_KEY)
      const nextAllowed = stored ? parseInt(stored, 10) : 0
      const now = Date.now()
      if (nextAllowed && now < nextAllowed) {
        return
      }
    } catch (error) {
      console.warn('Ad overlay cooldown check error', error)
      return
    }

    // Reklam yüklüyse göster
    try {
      await interstitialRef.current.show()
      // Reklam başarıyla gösterildi, cooldown'u reklam kapandığında set edeceğiz
    } catch (error) {
      console.warn('Interstitial show error', error)
      // Reklam yüklenmemiş, yükle
      if (interstitialRef.current) {
        interstitialRef.current.load()
      } else {
        loadInterstitial()
      }
    }
  }, [hasSubscription, loadInterstitial])

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
  }, [start])

  useEffect(() => {
    // (async () => {
    //   const { status } = await requestTrackingPermissionsAsync();
    //   if (status === 'granted') {
    //     console.log('Yay! I have user permission to track data');
    //   }
    // })();
    
    // Sadece bir kez çalıştır
    if (hasStartedRef.current) {
      console.log('[App] start() zaten çalıştırıldı, atlanıyor')
      return
    }
    
    hasStartedRef.current = true
    try {
      start()
    } catch (error) {
      console.error('[App] start() hatası:', error)
      hasStartedRef.current = false // Hata durumunda tekrar denemeye izin ver
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // start fonksiyonunu dependency'den çıkarıyoruz çünkü sadece bir kez çalışmasını istiyoruz


  const start = useCallback(async () => { 
    setRefresh(true)
    // var lcl=getLocales();
    
    // await AsyncStorage.setItem("lang-duaap",lcl[0].languageCode=="tr"?"tr":"ar")

    //  var sads=await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x }); //////Silinecek

    var tkn = await AsyncStorage.getItem("hlcapptokengDua").then(x => { return x })

    setTimeout(() => {
      setRefresh(false)

    }, 1000);   

    // SignalR bağlantısını başlat
    await initializeSignalR()





  }, [])
var ds=0;
  const initializeSignalR = useCallback(async () => {
  
    if(ds>1){
      return
    }
    ds=1;
  
    // Eğer zaten bağlantı kuruluyorsa, tekrar başlatma
    if (isInitializingRef.current) {
      console.log('[SignalR] Bağlantı zaten kuruluyor, iptal edildi')
      return
    }

    // Eğer bağlantı zaten varsa ve durumu uygunsa, tekrar bağlanma
    if (signalRConnectionRef.current) {
      const currentState = signalRConnectionRef.current.state
      console.log('[SignalR] Mevcut bağlantı durumu:', currentState)
      
      // Zaten bağlıysa veya bağlanıyorsa, tekrar bağlanma
      if (currentState === 'Connected' || currentState === 'Connecting' || currentState === 'Reconnecting') {
        console.log('[SignalR] Bağlantı zaten aktif, tekrar bağlanma iptal edildi')
        return
      }
      
      // Disconnected veya Disconnecting durumundaysa önce kapat
      if (currentState === 'Disconnected' || currentState === 'Disconnecting') {
        try {
          await signalRConnectionRef.current.stop()
          console.log('[SignalR] Eski bağlantı kapatıldı')
        } catch (stopError) {
          console.warn('[SignalR] Eski bağlantı kapatılırken hata:', stopError)
        }
        signalRConnectionRef.current = null
      }
    }

    try {
      isInitializingRef.current = true

      // DeviceId'yi AsyncStorage'dan al veya yeni UUID oluştur
      const deviceId = await getOrCreateDeviceId()

      const platform = Platform.OS === 'ios' ? 'ios' : 'android'
      console.log('[SignalR] Platform:', platform)
      console.log('[SignalR] DeviceId son durum:', deviceId)
      
      // DeviceId ve Platform bilgisini query string ile gönder
      const hubUrl = deviceId 
        ? `${apiConstant.SignalRHubUrl}?deviceId=${encodeURIComponent(deviceId)}&platform=${platform}`
        : `${apiConstant.SignalRHubUrl}?platform=${platform}`
      
      console.log('[SignalR] Hub URL:', hubUrl)

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.elapsedMilliseconds < 60000) {
              return 2000
            }
            return 5000
          }
        })
        .build()

      // Bağlantı event'leri
      connection.onclose((error) => {
        console.log('[SignalR] Connection closed', error)
        // Bağlantı kapandığında ref'i temizle
        if (signalRConnectionRef.current === connection) {
          signalRConnectionRef.current = null
          isInitializingRef.current = false
        }
      })

      connection.onreconnecting((error) => {
        console.log('[SignalR] Reconnecting', error)
      })

      connection.onreconnected((connectionId) => {
        console.log('[SignalR] Reconnected', connectionId)
      })

      // Bağlantıyı başlat
      await connection.start()
      console.log('[SignalR] Connected successfully')
      
      signalRConnectionRef.current = connection
      isInitializingRef.current = false
    } catch (error) {
      console.warn('[SignalR] Connection error:', error)
      // Hata durumunda ref'i temizle
      signalRConnectionRef.current = null
      isInitializingRef.current = false
    }
  }, [])

  // AppState değişikliklerini dinle
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const currentState = signalRConnectionRef.current?.state
        // Sadece bağlantı yoksa veya Disconnected durumundaysa bağlan
        if (!signalRConnectionRef.current || currentState === 'Disconnected') {
          console.log('[SignalR] AppState active, bağlantı başlatılıyor...')
          await initializeSignalR()
        } else {
          console.log('[SignalR] AppState active, mevcut bağlantı durumu:', currentState)
        }
      }
    })

    return () => {
      subscription?.remove()
    }
  }, [initializeSignalR])

  // Component unmount olduğunda bağlantıyı kapat
  useEffect(() => {
    return () => {
      if (signalRConnectionRef.current) {
        signalRConnectionRef.current.stop().catch(err => {
          console.warn('SignalR stop error:', err)
        })
      }
    }
  }, [])
 
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
      </View>
    )
  } else {
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <Index startBase={start} />
      </View>
    )
  }
}


//  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
