import React, { useEffect, useMemo } from 'react'
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native'
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads'

const getUnitId = (provided, fallback) => {
  if (provided && typeof provided === 'string' && provided.trim().length) {
    return provided.trim()
  }
  return fallback
}

const BannerSizes = {
  SMART_BANNER: BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  FULL_BANNER: BannerAdSize.FULL_BANNER,
  LARGE_BANNER: BannerAdSize.LARGE_BANNER,
}

const AdMobBanner = ({
  adUnitId,
  iosAdUnitId,
  androidAdUnitId,
  variant = 'banner',
  bannerSize = 'SMART_BANNER',
  style,
  showOnMount = true,
  placeholder,
  children,
  onAdLoaded,
  onAdFailedToLoad,
  onInterstitialClosed,
  requestOptions,
}) => {
  const platformUnit = useMemo(
    () =>
      Platform.select({
        ios: iosAdUnitId || adUnitId,
        android: androidAdUnitId || adUnitId,
        default: adUnitId,
      }),
    [adUnitId, iosAdUnitId, androidAdUnitId]
  )

  const isInterstitial = variant === 'interstitial'
  const fallbackUnitId = isInterstitial ? TestIds.INTERSTITIAL : TestIds.BANNER

  const resolvedUnitId = useMemo(
    () => getUnitId(platformUnit, fallbackUnitId),
    [platformUnit, fallbackUnitId]
  )

  useEffect(() => {
    if (!isInterstitial || !resolvedUnitId) {
      return undefined
    }

    const interstitial = InterstitialAd.createForAdRequest(resolvedUnitId, {
      requestNonPersonalizedAdsOnly: true,
      ...requestOptions,
    })

    const subscriptions = [
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        onAdLoaded?.()
        if (showOnMount) {
          interstitial.show().catch((error) => console.warn('Interstitial show error', error))
        }
      }),
      interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('AdMob Interstitial error', error)
        onAdFailedToLoad?.(error)
      }),
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        onInterstitialClosed?.()
      }),
    ]

    interstitial.load()

    return () => {
      subscriptions.forEach((unsubscribe) => {
        try {
          unsubscribe?.()
        } catch (error) {
          console.warn('Interstitial cleanup error', error)
        }
      })
    }
  }, [
    isInterstitial,
    resolvedUnitId,
    requestOptions,
    showOnMount,
    onAdLoaded,
    onAdFailedToLoad,
    onInterstitialClosed,
  ])

  if (isInterstitial) {
    if (placeholder) {
      return placeholder
    }
    if (children) {
      return <>{children}</>
    }
    return (
      <View style={[styles.fullscreenPlaceholder, style]}>
        <View style={styles.placeholderBackdrop} />
        <View style={styles.placeholderContent}>
          <ActivityIndicator size="large" color="#FFCC80" />
          <Text style={styles.placeholderText}>Reklam hazırlanıyor...</Text>
        </View>
      </View>
    )
  }

  if (!resolvedUnitId) {
    console.warn('AdMobBanner: adUnitId is required in production builds.')
    return null
  }

  const resolvedSize = BannerSizes[bannerSize] || bannerSize

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={resolvedUnitId}
        size={resolvedSize}
        requestOptions={requestOptions}
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={(error) => {
          console.warn('AdMob Banner error', error)
          onAdFailedToLoad?.(error)
        }}
      />
    </View>
  )
}

export default AdMobBanner

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interstitialPlaceholder: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    color: '#ECEFF1',
    fontSize: 14,
  },
  fullscreenPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  placeholderContent: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

