import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, Platform } from 'react-native'
import Purchases from 'react-native-purchases'
import AdMobBanner from './AdMobBanner'

const APIKeys = {
  apple: 'appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX',
  google: 'goog_OfndwmvoPjhIPGFfcHLzfGuYPIR',
}

const AdmobViewBanner = ({
  adUnitId,
  iosAdUnitId,
  androidAdUnitId,
  bannerSize = 'SMART_BANNER',
  style,
  requestOptions,
  ...restProps
}) =>{
  const [hasSubscription, setHasSubscription] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkSubscription = async () => {
      try {
        if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey: APIKeys.google })
        } else {
          await Purchases.configure({ apiKey: APIKeys.apple })
        }

        const customerInfo = await Purchases.getCustomerInfo()
        const isActive = customerInfo?.entitlements?.active?.['naim1016'] !== undefined

        if (isMounted) {
          setHasSubscription(isActive)
          setLoading(false)
        }
      } catch (error) {
        console.warn('AdmobViewBanner subscription check error', error)
        if (isMounted) {
          setHasSubscription(false)
          setLoading(false)
        }
      }
    }

    checkSubscription()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading || hasSubscription) {
    return null
  }

  return (
    <View style={style}>
      <AdMobBanner
        variant="banner"
        adUnitId={adUnitId}
        iosAdUnitId={iosAdUnitId}
        androidAdUnitId={androidAdUnitId}
        bannerSize={bannerSize}
        requestOptions={requestOptions}
        {...restProps}
      />
    </View>
  )
}

export default AdmobViewBanner




