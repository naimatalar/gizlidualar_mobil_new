import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiConstant from './dataApi/apiConstant'
import { PostAxios } from './dataApi/crud'

export const registerAndSavePushToken = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      }).catch((err) => console.warn('Notification channel error', err))
    }

    if (!Device.isDevice) {
      console.log('[PushToken] Fiziksel cihaz gerekli')
      return
    }
 
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.log('[PushToken] Bildirim izni verilmedi')
      return
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
    if (!projectId) {
      console.warn('[PushToken] Project ID bulunamadı')
      return
    }

    try {
      const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data
      console.log('[PushToken] Token alındı:', pushToken)

      if (!pushToken || pushToken.trim() === '') {
        console.warn('[PushToken] Token boş geldi')
        return
      }

      // Token'ı backend'e kaydet
      const token = await AsyncStorage.getItem('hlcapptokengDua')
      if (!token || token.trim() === '') {
        console.log('[PushToken] Kullanıcı token\'ı yok, giriş yapılmamış')
        return
      }

      try {
        const endpoint = apiConstant.BaseUrl + '/api/Auth/UpdatePushToken'
        const response = await PostAxios(endpoint, { PushToken: pushToken })
        
        // Response kontrolü
        if (response?.data) {
          if (response.data.isError) {
            console.warn('[PushToken] Backend hatası:', response.data.message)
          } else {
            console.log('[PushToken] Token backend\'e kaydedildi:', response.data.message)
          }
        } else {
          console.warn('[PushToken] Backend\'den geçersiz yanıt alındı')
        }
      } catch (error) {
        // Detaylı hata loglama
        const errorMessage = error?.message || 'Bilinmeyen hata'
        const errorResponse = error?.response?.data || {}
        const errorStatus = error?.response?.status || 'N/A'
        
        console.warn('[PushToken] Backend\'e kaydetme hatası:')
        console.warn('  - Mesaj:', errorMessage)
        console.warn('  - Status:', errorStatus)
        console.warn('  - Response:', JSON.stringify(errorResponse))
        
        // Network hatası kontrolü
        if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
          console.warn('[PushToken] Ağ hatası - internet bağlantısını kontrol edin')
        }
      }
    } catch (tokenError) {
      // Firebase/FCM credentials hatası - development modunda normal, production build'de otomatik çözülür
      const errorMessage = tokenError?.message || ''
      const errorStack = tokenError?.stack || ''
      
      if (errorMessage.includes('Firebase') || errorMessage.includes('FCM') || errorMessage.includes('FirebaseApp')) {
        // Firebase/FCM hatası - EAS Build credentials eksik olabilir veya yapılandırma gerekebilir
        // Sessizce geç, kullanıcıya gösterme
        console.warn('[PushToken] Firebase/FCM hatası:', errorMessage)
        return
      }
      // Diğer hatalar için detaylı log
      console.warn('[PushToken] Token alma hatası:')
      console.warn('  - Mesaj:', errorMessage)
      console.warn('  - Stack:', errorStack)
    }
  } catch (error) {
    // Genel hata yakalama
    const errorMessage = error?.message || ''
    if (errorMessage.includes('Firebase') || errorMessage.includes('FCM') || errorMessage.includes('FirebaseApp')) {
      // Firebase hatası - sessizce geç
      return
    }
    console.warn('[PushToken] Token kaydetme hatası:', errorMessage)
  }
}

