import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native'
import Purchases from 'react-native-purchases'
import { LangApp } from '../../components/Language'

const APIKeys = {
    apple: 'appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX',
    google: 'goog_OfndwmvoPjhIPGFfcHLzfGuYPIR',
}

const RemoveAdsSubscription = ({ navigation, start }) => {
    const [loading, setLoading] = useState(true)
    const [subscriptionPackage, setSubscriptionPackage] = useState(null)
    const [purchasing, setPurchasing] = useState(false)
    const [resetting, setResetting] = useState(false)

    useEffect(() => {
        setupRevenueCat()
        console.log("start", start)
     
        return () => {
            // Cleanup if needed
        }
    }, [])

    const setupRevenueCat = async () => {
        try {
            if (Platform.OS === 'android') {
                await Purchases.configure({ apiKey: APIKeys.google })
            } else {
                await Purchases.configure({ apiKey: APIKeys.apple })
            }

            const offerings = await Purchases.getOfferings()
            if (offerings.current) {
                const reklamsizPackage = offerings.current.availablePackages.find(
                    (pkg) => pkg.identifier === 'reklamsiz'
                )
                if (reklamsizPackage) {
                    setSubscriptionPackage(reklamsizPackage)
                } else {
                    console.warn('Reklamsiz package not found in available packages')
                    Alert.alert('Hata', 'Reklamsız kullanım paketi bulunamadı.')
                }
            } else {
                Alert.alert('Hata', 'Abonelik paketleri yüklenemedi.')
            }
        } catch (error) {
            console.warn('RevenueCat setup error', error)
            Alert.alert('Hata', 'Abonelik bilgileri yüklenirken bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {

        if (!subscriptionPackage) {
            Alert.alert('Hata', 'Paket bilgisi bulunamadı.')
            return
        }

        setPurchasing(true)
        try {

            if (!subscriptionPackage) {
                Alert.alert('Hata', 'Paket bilgisi bulunamadı.')
                return
            }

            if (!Purchases) {
                throw new Error('Purchases is not available')
            }

            if (typeof Purchases.purchasePackage !== 'function') {
                console.log('[Purchase] Step 10: purchasePackage is not a function')
                throw new Error('Purchases.purchasePackage is not a function')
            }


            let purchaseResult
            try {
                purchaseResult = await Purchases.purchasePackage(subscriptionPackage)
                console.log('[Purchase] Step 12: Purchase completed! purchasePackage resolved')
                console.log('[Purchase] Step 12.1: purchaseResult:', purchaseResult)
            } catch (purchaseError) {
                console.error('[Purchase] Step 12 ERROR: purchasePackage threw error:', purchaseError)
                console.error('[Purchase] Error details:', {
                    message: purchaseError?.message,
                    code: purchaseError?.code,
                    userCancelled: purchaseError?.userCancelled,
                    type: typeof purchaseError
                })
                throw purchaseError
            }

            console.log('[Purchase] Step 13: Getting customerInfo...')
            let customerInfo
            if (purchaseResult?.customerInfo) {
                customerInfo = purchaseResult.customerInfo
                console.log('[Purchase] Step 13.1: Using customerInfo from purchaseResult')
            } else {
                console.log('[Purchase] Step 13.2: Getting customerInfo from Purchases.getCustomerInfo()')
                customerInfo = await Purchases.getCustomerInfo()
            }

            console.log('[Purchase] Step 14: CustomerInfo received')
            console.log('[Purchase] Step 14.1: CustomerInfo type:', typeof customerInfo)
            console.log('[Purchase] Step 14.2: Active entitlements:', Object.keys(customerInfo?.entitlements?.active || {}))

            // Önce direkt kontrol et
            if (customerInfo?.entitlements?.active?.['naim1016']) {
                console.log('[Purchase] Entitlement immediately active')

                // Abonelik kontrolünün tamamlanması için kısa bir bekleme
                await new Promise(resolve => setTimeout(resolve, 500))
                alert("Satın alma başarılı")
                globalThis.__START_APP()
                // Satın alma başarılı, navigation goBack yap
                if (navigation.canGoBack()) {
                    navigation.goBack()
                } else {
                    navigation.navigate('Home')
                }

                return
            }

            // Eğer hemen aktif olmadıysa, biraz bekleyip tekrar kontrol et
            console.log('[Purchase] Entitlement not immediately active, waiting and checking again...')
            await new Promise(resolve => setTimeout(resolve, 2000)) // 2 saniye bekle

            const refreshedCustomerInfo = await Purchases.getCustomerInfo()
            console.log('[Purchase] Refreshed CustomerInfo:', JSON.stringify(refreshedCustomerInfo, null, 2))
            console.log('[Purchase] Refreshed active entitlements:', Object.keys(refreshedCustomerInfo.entitlements.active))

            if (refreshedCustomerInfo.entitlements.active['naim1016']) {
                // Abonelik kontrolünün tamamlanması için kısa bir bekleme
                await new Promise(resolve => setTimeout(resolve, 500))

                alert("Satın alma başarılı")
                globalThis.__START_APP()
                // Satın alma başarılı, navigation goBack yap
                if (navigation.canGoBack()) {
                    navigation.goBack()
                } else {
                    navigation.navigate('Home')
                }

                return
            }

            // Hala aktif değilse, detaylı bilgi göster
            const allEntitlementKeys = Object.keys(refreshedCustomerInfo.entitlements.all)
            const activeEntitlementKeys = Object.keys(refreshedCustomerInfo.entitlements.active)

            console.warn('Entitlement still not active')
            console.warn('Available entitlement keys:', allEntitlementKeys)
            console.warn('Active entitlement keys:', activeEntitlementKeys)

            Alert.alert(
                'Uyarı',
                `Satın alma tamamlandı ancak 'naim1016' entitlement aktif değil.\n\n` +
                `Aktif entitlements: ${activeEntitlementKeys.length > 0 ? activeEntitlementKeys.join(', ') : 'Yok'}\n` +
                `Tüm entitlements: ${allEntitlementKeys.length > 0 ? allEntitlementKeys.join(', ') : 'Yok'}\n\n` +
                `Lütfen konsol loglarını kontrol edin.`
            )
        } catch (error) {
            console.error('[Purchase] Error caught:', error)
            console.error('[Purchase] Error type:', typeof error)
            console.error('[Purchase] Error message:', error?.message)
            console.error('[Purchase] Error code:', error?.code)
            console.error('[Purchase] User cancelled:', error?.userCancelled)

            if (error?.userCancelled) {
                console.log('[Purchase] User cancelled the purchase')
                // Kullanıcı iptal etti, sessizce devam et
            } else {
                console.error('[Purchase] Purchase failed with error:', error)
                Alert.alert(
                    'Hata',
                    `Satın alma işlemi başarısız oldu: ${error?.message || error?.code || 'Bilinmeyen hata'}\n\n` +
                    `Lütfen konsol loglarını kontrol edin.`
                )
            }
        } finally {
            console.log('[Purchase] Finally block - setting purchasing to false')
            setPurchasing(false)
        }
    }

    const handleResetSubscription = async () => {
        Alert.alert(
            'Aboneliği Sıfırla',
            'Test aboneliğini sıfırlamak istediğinize emin misiniz?',
            [
                {
                    text: 'İptal',
                    style: 'cancel',
                },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        setResetting(true)
                        try {
                            // Önce normal kullanıcılar için logOut() dene
                            try {
                                await Purchases.logOut()
                                Alert.alert('Başarılı', 'Abonelik sıfırlandı. Uygulamayı yeniden başlatmanız gerekebilir.', [
                                    {
                                        text: 'Tamam',
                                        onPress: () => {
                                            navigation.goBack()
                                        },
                                    },
                                ])
                                return
                            } catch (logOutError) {
                                // Eğer anonymous kullanıcı hatası gelirse
                                if (logOutError.message && logOutError.message.includes('anonymous')) {
                                    console.log('Anonymous user detected, using alternative reset method...')

                                    // Anonymous kullanıcı için restorePurchases() çağırıp durumu yenile
                                    // Test ortamında iptal edilen aboneliğin durumu güncellenecek
                                    try {
                                        await Purchases.restorePurchases()
                                        const refreshedCustomerInfo = await Purchases.getCustomerInfo()

                                        console.log('After restore - Active entitlements:', Object.keys(refreshedCustomerInfo.entitlements.active))

                                        // Eğer hala aktif entitlement varsa, kullanıcıyı bilgilendir
                                        if (refreshedCustomerInfo.entitlements.active['naim1016']) {
                                            Alert.alert(
                                                'Bilgi',
                                                'Test aboneliği hala aktif görünüyor. Google Play / App Store\'dan test aboneliğini iptal edip, birkaç dakika bekledikten sonra tekrar deneyin.\n\n' +
                                                'Alternatif: RevenueCat dashboard\'dan test aboneliğini manuel olarak silebilirsiniz.'
                                            )
                                        } else {
                                            Alert.alert(
                                                'Başarılı',
                                                'Abonelik durumu güncellendi. Test aboneliği artık aktif değil.\n\n' +
                                                'Tekrar test etmek için satın alma işlemini yeniden yapabilirsiniz.'
                                            )
                                        }
                                    } catch (restoreError) {
                                        console.warn('Restore purchases error', restoreError)
                                        Alert.alert(
                                            'Bilgi',
                                            'Anonymous kullanıcılar için aboneliği uygulama içinden sıfırlamak mümkün değil.\n\n' +
                                            'Test aboneliğini sıfırlamak için:\n' +
                                            '1. Google Play Console / App Store Connect\'ten test aboneliğini iptal edin\n' +
                                            '2. Veya RevenueCat dashboard\'dan test aboneliğini manuel olarak silin\n\n' +
                                            'Alternatif: Uygulamayı kaldırıp yeniden yükleyerek yeni bir anonymous kullanıcı oluşturabilirsiniz.'
                                        )
                                    }
                                } else {
                                    // Diğer hatalar için
                                    throw logOutError
                                }
                            }
                        } catch (error) {
                            console.warn('Reset subscription error', error)
                            Alert.alert(
                                'Hata',
                                `Abonelik sıfırlanırken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}\n\n` +
                                'Alternatif: RevenueCat dashboard\'dan test aboneliğini manuel olarak silebilirsiniz.'
                            )
                        } finally {
                            setResetting(false)
                        }
                    },
                },
            ]
        )
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Paket bilgileri yükleniyor...</Text>
            </View>
        )
    }

    if (!subscriptionPackage) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Paket bulunamadı</Text>
                <TouchableOpacity  delayLongPress={()=>{return true}  }  
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Reklamsız/Premium</Text>
                <Text style={styles.description}>
                    Tüm reklamları kaldırın ve kesintisiz deneyim yaşayın.
                </Text>

                <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>Özellikler:</Text>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>•</Text>
                        <Text style={styles.featureText}>Tüm reklamlar kaldırılır</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureBullet}>•</Text>
                        <Text style={styles.featureText}>Uygulama arka plandayken dinleme özelliği</Text>
                    </View>
                </View>

                <View style={styles.packageContainer}>
                    <Text style={styles.packageTitle}>
                        {subscriptionPackage?.product?.title || subscriptionPackage?.identifier || 'Reklamsız/Premium'}
                    </Text>
                    {subscriptionPackage?.product?.description && (
                        <Text style={styles.packageDescription}>
                            {subscriptionPackage.product.description}
                        </Text>
                    )}
                    <Text style={styles.packagePrice}>
                        {subscriptionPackage?.product?.priceString || 'Fiyat bilgisi yükleniyor...'}
                    </Text>
                </View>

                <TouchableOpacity  delayLongPress={()=>{return true}  }  
                    style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
                    onPress={handlePurchase}
                    disabled={purchasing}
                >
                    {purchasing ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.purchaseButtonText}>Satın Al</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.note}>
                    * Abonelik otomatik olarak yenilenecektir. İstediğiniz zaman iptal
                    edebilirsiniz.
                </Text>

                <TouchableOpacity  delayLongPress={()=>{return true}  }  
                    style={[styles.resetButton, resetting && styles.resetButtonDisabled,{display: 'none'}]}
                    onPress={handleResetSubscription}
                    disabled={resetting}
                >
                    {resetting ? (
                        <ActivityIndicator size="small" color="#d32f2f" />
                    ) : (
                        <Text style={styles.resetButtonText}>Test: Aboneliği Sıfırla</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    packageContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 20,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#2E7D32',
    },
    packageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    packageDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    packagePrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    purchaseButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    purchaseButtonDisabled: {
        opacity: 0.6,
    },
    purchaseButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        marginBottom: 16,
        textAlign: 'center',
    },
    note: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    resetButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#d32f2f',
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    featuresContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    featureBullet: {
        fontSize: 16,
        color: '#2E7D32',
        marginRight: 8,
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
})

export default RemoveAdsSubscription

