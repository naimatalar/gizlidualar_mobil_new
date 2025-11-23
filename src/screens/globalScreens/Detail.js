import React from 'react';
import { useState, useRef, useCallback } from 'react';
import { useEffect } from 'react';
import { Dimensions, Image, Platform, TouchableOpacity, Modal, StyleSheet, InteractionManager } from 'react-native';
import { View, Text, ScrollView } from 'react-native';
import Background from '../../components/Background';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud';
import MaterialCommunityIcons
    from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../../components/Loading';
import PowerProgress from '../../components/PowerProgress';
import { DeviceLanguage, LangApp } from '../../components/Language';
import Purchases from 'react-native-purchases';
import { RewardedAd, AdEventType, RewardedAdEventType } from 'react-native-google-mobile-ads';
function Detail(props) {

    const [dua, setDua] = useState([])
    const [pageOk, setPageOk] = useState(false)
    const [page, setPage] = useState(1)
    const [refresh, setRefresh] = useState(new Date())
    const [loadinData, setLoadinData] = useState(false)
    const [unlockedDua, setUnlockedDua] = useState([])
    const [packages, setPackages] = useState([]);
    const [rewardModalVisible, setRewardModalVisible] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [adLoading, setAdLoading] = useState(false)
    const [hasSubscription, setHasSubscription] = useState(false)
    const [isAdLoaded, setIsAdLoaded] = useState(false)
    const [isAdShowing, setIsAdShowing] = useState(false) // iOS'ta reklam gösterilirken custom buton için
    const rewardedAdRef = useRef(null)
    const isAdLoadedRef = useRef(false)
    const selectedItemRef = useRef(null)
    const rewardEarnedRef = useRef(false) // iOS'ta EARNED_REWARD event'inin tetiklendiğini takip et

    const APIKeys = {
        apple: "appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX",
        google: "goog_OfndwmvoPjhIPGFfcHLzfGuYPIR",
    };
    // console.log(props.route.params.item)

    if (DeviceLanguage == "ar") {
        props.navigation.setOptions({ title: props.route.params.item.nameArabic })
    } else {
        props.navigation.setOptions({ title: props.route.params.item.name })
    }

    // Ödüllü reklam yükleme
    const loadRewardedAd = useCallback(() => {
        const iosAdUnitId = 'ca-app-pub-8795169628743262/1276761521'
        const androidAdUnitId = 'ca-app-pub-8795169628743262/9466258645'
        const adUnitId = Platform.OS === 'ios' ? iosAdUnitId : androidAdUnitId

        console.log(`[RewardedAd] Loading ad for ${Platform.OS}, AdUnitId: ${adUnitId}`)

        const rewarded = RewardedAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        })

        const subscriptions = [
            rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
                // Reklam yüklendi
                console.log(`[RewardedAd] Ad loaded successfully for ${Platform.OS}`)
                setIsAdLoaded(true)
                isAdLoadedRef.current = true
                setAdLoading(false)
            }),
            rewarded.addAdEventListener(AdEventType.OPENED, () => {
                // Reklam açıldı - iOS'ta custom buton göster
                console.log(`[RewardedAd] Ad opened for ${Platform.OS}`)
                if (Platform.OS === 'ios') {
                    setIsAdShowing(true)
                }
            }),
            rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
                // Ödül kazanıldı
                console.log(`[RewardedAd] Reward earned:`, reward)
                console.log(`[RewardedAd] Platform: ${Platform.OS}`)
                
                // iOS'ta EARNED_REWARD event'inde hiçbir şey yapma
                // iOS'ta kullanıcı kapat butonuna basınca CLOSED event'inde navigation yapılacak
                if (Platform.OS === 'ios') {
                    console.log(`[RewardedAd] iOS: EARNED_REWARD event - no action, waiting for CLOSED event`)
                    // Sadece flag'i set et, navigation yapma
                    rewardEarnedRef.current = true
                    return
                }
                
                // Android'de: Normal akış - Steps sayfasına geç
                console.log(`[RewardedAd] Android: Navigating to Steps with item`)
                
                // Ref'ten item'ı al (closure sorununu önlemek için)
                const currentItem = selectedItemRef.current
                if (currentItem) {
                    console.log(`[RewardedAd] Android: Closing modal and preparing navigation`)
                    
                    // State'leri güncelle
                    setRewardModalVisible(false)
                    setAdLoading(false)
                    setIsAdLoaded(false)
                    isAdLoadedRef.current = false
                    setSelectedItem(null)
                    
                    // Android'de: Kullanıcı reklamı kapattığı için biraz bekle
                    setTimeout(() => {
                        console.log(`[RewardedAd] Android: Executing navigation`)
                        try {
                            props.navigation.navigate("Steps", { item: currentItem })
                            selectedItemRef.current = null
                            console.log(`[RewardedAd] Android: Navigation completed successfully`)
                        } catch (navError) {
                            console.error(`[RewardedAd] Android: Navigation error:`, navError)
                        }
                    }, 300) // Android'de 300ms - kullanıcı etkileşimi için
                } else {
                    console.warn(`[RewardedAd] Android: No selected item found`)
                    setRewardModalVisible(false)
                    setAdLoading(false)
                }
            }),
            rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
                console.warn(`[RewardedAd] Error for ${Platform.OS}:`, error)
                console.warn(`[RewardedAd] Error code:`, error.code)
                console.warn(`[RewardedAd] Error message:`, error.message)
                setIsAdLoaded(false)
                isAdLoadedRef.current = false
                setAdLoading(false)
            }),
            rewarded.addAdEventListener(AdEventType.CLOSED, () => {
                // Reklam kapandı
                console.log(`[RewardedAd] Ad closed for ${Platform.OS}`)
                console.log(`[RewardedAd] rewardEarnedRef.current: ${rewardEarnedRef.current}`)
                
                // iOS ve Android için farklı yaklaşımlar
                if (Platform.OS === 'ios') {
                    // iOS'ta: EARNED_REWARD event'i tetiklendiyse (kullanıcı kapat butonuna bastı)
                    // Modal'ı kapat ve Steps sayfasına git
                    if (rewardEarnedRef.current) {
                        console.log(`[RewardedAd] iOS: EARNED_REWARD was triggered, user closed ad - navigating to Steps`)
                        
                        // Ref'ten item'ı al
                        const currentItem = selectedItemRef.current
                        if (currentItem) {
                            // Modal'ı kapat
                            setRewardModalVisible(false)
                            setAdLoading(false)
                            setIsAdLoaded(false)
                            isAdLoadedRef.current = false
                            setSelectedItem(null)
                            
                            // iOS'ta: Modal'ın tamamen kapanması için kısa bekleme
                            setTimeout(() => {
                                console.log(`[RewardedAd] iOS: Executing navigation after ad close`)
                                try {
                                    // Modal'ın kesinlikle kapalı olduğundan emin ol
                                    setRewardModalVisible(false)
                                    
                                    // Navigation yap
                                    props.navigation.navigate("Steps", { item: currentItem })
                                    
                                    // Ref'leri temizle
                                    selectedItemRef.current = null
                                    
                                    // Flag'i sıfırla
                                    rewardEarnedRef.current = false
                                    
                                    console.log(`[RewardedAd] iOS: Navigation completed successfully`)
                                } catch (navError) {
                                    console.error(`[RewardedAd] iOS: Navigation error:`, navError)
                                    // Hata durumunda state'leri temizle
                                    setRewardModalVisible(false)
                                    setAdLoading(false)
                                    rewardEarnedRef.current = false
                                }
                                
                                // Yeni reklam yükle
                                setTimeout(() => {
                                    setIsAdLoaded(false)
                                    isAdLoadedRef.current = false
                                    loadRewardedAd()
                                }, 500)
                            }, 200) // iOS'ta 200ms - modal unmount için
                        } else {
                            console.warn(`[RewardedAd] iOS: No selected item found in CLOSED event`)
                            setRewardModalVisible(false)
                            setAdLoading(false)
                            rewardEarnedRef.current = false
                        }
                    } else {
                        // iOS'ta EARNED_REWARD tetiklenmediyse (reklam hata verdi veya kullanıcı kapattı)
                        console.log(`[RewardedAd] iOS: EARNED_REWARD not triggered, closing modal normally`)
                        setRewardModalVisible(false)
                        setAdLoading(false)
                        setSelectedItem(null)
                        selectedItemRef.current = null
                        
                        setTimeout(() => {
                            setIsAdLoaded(false)
                            isAdLoadedRef.current = false
                            loadRewardedAd()
                        }, 500)
                    }
                } else {
                    // Android'de: Normal akış - kullanıcı reklamı kapattı
                    console.log(`[RewardedAd] Android: Normal close flow`)
                    setIsAdLoaded(false)
                    isAdLoadedRef.current = false
                    setAdLoading(false)
                    // Yeni reklam yükle
                    loadRewardedAd()
                }
            }),
        ]

        setIsAdLoaded(false)
        isAdLoadedRef.current = false
        rewarded.load()
        rewardedAdRef.current = rewarded

        return () => {
            subscriptions.forEach((unsubscribe) => {
                try {
                    unsubscribe?.()
                } catch (error) {
                    console.warn('RewardedAd cleanup error', error)
                }
            })
        }
    }, [props.navigation])

    useEffect(() => {
        getCategory(page);



        const setup = async () => {
            // alert("fds")
            if (Platform.OS == "android") {

                await Purchases.configure({ apiKey: APIKeys.google });
            }

            else {
                await Purchases.configure({ apiKey: APIKeys.apple });
            }

            const offerings = await Purchases.getOfferings()

            // setLoading(false) 
            setPackages(offerings.current.availablePackages);

            //   rps.data.coin 
            Purchases.setDebugLogsEnabled(true)

            // Abonelik kontrolü
            try {
                const customerInfo = await Purchases.getCustomerInfo()
                const isActive = customerInfo.entitlements.active['naim1016'] !== undefined
                setHasSubscription(isActive)
            } catch (error) {
                console.warn('Subscription check error in Detail', error)
                setHasSubscription(false)
            }
        };


        setup()
            .catch("EEEEEER", console.log);

        // Ödüllü reklamı yükle
        const cleanup = loadRewardedAd()
        return cleanup
    }, [props, loadRewardedAd])

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    const getCategory = async (p) => {

        var duadd = await apiConstant.BaseUrl + `/api/usermanager/getcurrentunlockeddua/`
        var duaRsp = await GetAxios(duadd).then(x => { return x.data }).catch(x => { return x });
        setUnlockedDua(duaRsp.data)
        setLoadinData(true)
        var endpoint = await apiConstant.BaseUrl + "/api/dualar/GetAllMobil/"

        var rps = await PostAxiosAnonym(endpoint, { categoryId: props.route.params.item.id, pageSize: 10, pageNumber: p }).then(x => { return x.data }).catch(x => { return x });


        if (rps.data.totalCount / 2 > 1) {


            if (rps.data.pageNumber == (rps.data.totalCount / 2).toFixed(0)) {
                setPageOk(true)
                setLoadinData(false)
                return false
            }
        }
        setPage(p)
        var rd = dua
        for (const iterator of rps.data.list) {
            rd.push(iterator)
        }
        setDua(rd)
        setRefresh(new Date())
        setLoadinData(false)
    }

    const handleDuaPress = (item) => {
        setSelectedItem(item)
        selectedItemRef.current = item
        // Abone ise direkt Steps sayfasına git
        if (hasSubscription || globalThis.__IS_SUBSCRIBED) {
            props.navigation.navigate("Steps", { item })
            return
        }
        // Abone değilse modal aç
        setRewardModalVisible(true)
        // Reklam yüklüyse hazır, değilse yükle
        if (!rewardedAdRef.current) {
            loadRewardedAd()
        }
    }

    const handleWatchAd = async () => {
        // Abone ise reklam göstermeden direkt Steps sayfasına git
        if (hasSubscription || globalThis.__IS_SUBSCRIBED) {
            if (selectedItem) {
                setRewardModalVisible(false)
                setSelectedItem(null)
                props.navigation.navigate("Steps", { item: selectedItem })
            }
            return
        }

        console.log(`[RewardedAd] handleWatchAd called for ${Platform.OS}`)
        console.log(`[RewardedAd] isAdLoaded: ${isAdLoadedRef.current}`)
        console.log(`[RewardedAd] rewardedAdRef.current:`, rewardedAdRef.current ? 'exists' : 'null')
        
        setAdLoading(true)
        
        // Reklam yüklenmemişse yükle ve bekle
        if (!rewardedAdRef.current || !isAdLoadedRef.current) {
            console.log(`[RewardedAd] Ad not loaded, loading new ad...`)
            loadRewardedAd()
            
            // iOS'ta reklam yüklenene kadar bekle (max 5 saniye)
            let waitCount = 0
            const maxWait = 10 // 5 saniye (10 * 500ms)
            
            const checkInterval = setInterval(() => {
                waitCount++
                console.log(`[RewardedAd] Waiting for ad... (${waitCount}/${maxWait})`)
                
                if (isAdLoadedRef.current && rewardedAdRef.current) {
                    clearInterval(checkInterval)
                    console.log(`[RewardedAd] Ad loaded, showing...`)
                    // Reklam yüklendi, göster
                    try {
                        const showPromise = rewardedAdRef.current.show()
                        if (showPromise && typeof showPromise.then === 'function') {
                            showPromise
                                .then(() => {
                                    console.log(`[RewardedAd] Ad show called successfully for ${Platform.OS}`)
                                })
                                .catch((error) => {
                                    console.warn(`[RewardedAd] Show error for ${Platform.OS}:`, error)
                                    setAdLoading(false)
                                    setIsAdLoaded(false)
                                    isAdLoadedRef.current = false
                                    alert('Reklam gösterilemedi. Lütfen tekrar deneyin.')
                                })
                        } else {
                            console.warn(`[RewardedAd] show() did not return a promise`)
                            setAdLoading(false)
                        }
                    } catch (error) {
                        console.error(`[RewardedAd] Error calling show() for ${Platform.OS}:`, error)
                        setAdLoading(false)
                        setIsAdLoaded(false)
                        isAdLoadedRef.current = false
                        alert('Reklam gösterilemedi. Lütfen tekrar deneyin.')
                    }
                } else if (waitCount >= maxWait) {
                    clearInterval(checkInterval)
                    console.warn(`[RewardedAd] Ad loading timeout for ${Platform.OS}`)
                    setAdLoading(false)
                    alert('Dua yüklenemedi tekrar deneyin.')
                }
            }, 500)
            return
        }

        // Reklam yüklü, direkt göster
        try {
            console.log(`[RewardedAd] Attempting to show ad for ${Platform.OS}`)
            try {
                if (!rewardedAdRef.current) {
                    throw new Error('Rewarded ad is null')
                }
                if (!isAdLoadedRef.current) {
                    throw new Error('Rewarded ad is not loaded')
                }
                const showPromise = rewardedAdRef.current.show()
                if (showPromise && typeof showPromise.then === 'function') {
                    await showPromise
                } else {
                    console.warn(`[RewardedAd] show() did not return a promise`)
                }
            } catch (error) {
                console.error(`[RewardedAd] Error calling show() for ${Platform.OS}:`, error)
                setAdLoading(false)
                setIsAdLoaded(false)
                isAdLoadedRef.current = false
                throw error
            }
            console.log(`[RewardedAd] Ad show called successfully for ${Platform.OS}`)
        } catch (error) {
            console.warn(`[RewardedAd] Show error for ${Platform.OS}:`, error)
            console.warn(`[RewardedAd] Error details:`, JSON.stringify(error))
            setAdLoading(false)
            setIsAdLoaded(false)
            isAdLoadedRef.current = false
            // Reklam yüklenmemiş, yükle
            loadRewardedAd()
            // Hata mesajı göster
            alert('Reklam gösterilemedi. Lütfen tekrar deneyin.')
        }
    }

    const handleCancel = () => {
        console.log(`[RewardedAd] handleCancel called`)
        setRewardModalVisible(false)
        setSelectedItem(null)
        selectedItemRef.current = null
        setAdLoading(false)
        setIsAdLoaded(false)
        isAdLoadedRef.current = false
    }

    return (
        <Background>
            {refresh > 0 && <ScrollView style={{ width: "100%" }}
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {

                        getCategory(page + 1)

                    }
                }}
            >
                {dua.map((item, key) => {
                    //  console.log(item.imageUrl)
                    let isUnlocked = unlockedDua?.find(x => { return x == item.id })

                    return <TouchableOpacity key={key} style={{
                        flexDirection: "row",
                        width: "97%",
                        height: 130,
                        alignItems: "center",
                        backgroundColor: "#F3E5F5",
                        borderWidth: 1,
                        borderColor: "#9C27B0",
                        borderStyle: "solid",
                        paddingBottom: 10,
                        paddingTop: 10,
                        borderRadius: 10,
                        alignSelf: "center",
                        marginTop: 25,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 5,
                        },
                        shadowOpacity: 0.49,
                        shadowRadius: 6.27,
 
                        elevation: 12,
                    }} 
                    delayLongPress={()=>{return true}  }  
                    onPress={() => { handleDuaPress(item) }}>
                        <View style={{ flex: 3 }}>
                            <Image style={{ resizeMode: "contain", width: "100%", height: "100%" }} source={{ uri: apiConstant.IMAGEBASEURL + "/" + item.imageUrl }}></Image>




                        </View>
                        {item.coin > 0 && !isUnlocked && <View style={{
                            position: "absolute", zIndex: 999,
                            borderColor: "red",
                            borderStyle: "dotted",
                            backgroundColor: "orange",
                            borderWidth: 1,
                            top: 2,
                            padding: 2,
                            borderRadius: 8,
                            right: 2,
                        }}>
                            <Text style={{ fontSize: 13 }}>
                                {/* {"  "}<MaterialCommunityIcons

                                    name={"key"}
                                    size={14}
                                    color={"white"}
                                /> */}
                                <Text style={{ color: "white" }}>
                                  
                                    {packages.find(x => { return x.identifier == item.coin })?.product.priceString
                                    }
                                </Text>
                            </Text>

                        </View>}
                        {isUnlocked && <View style={{
                            position: "absolute", zIndex: 999,
                            backgroundColor: "#126f2c",
                            top: 2,
                            pledding: 2,
                            borderRadius: 8,
                            right: 2
                        }}>
                            <Text style={{ fontSize: 14 }}>
                                {"  "}<MaterialCommunityIcons

                                    name={"lock-check"}
                                    size={16}
                                    color={"white"}
                                />

                                <Text style={{ color: "white" }}> {LangApp("acildi")}   </Text>
                            </Text>

                        </View>}
                        <View style={{ flex: 6 }}>

                            <View style={{ justifyContent: "center", flexDirection: "row" }}>



                                {DeviceLanguage == "ar" && <Text style={{ fontWeight: "bold", fontSize: 16, textAlign: "center" }}>{item.titleArabic}</Text> || <Text style={{ fontWeight: "bold", fontSize: 16, textAlign: "center" }}>{item.title}</Text>}


                            </View>
                            <View >
                                {DeviceLanguage == "ar" && <Text style={{ fontSize: 13 }}>{item.descriptionArabic}... </Text> || <Text style={{ fontSize: 13 }}>{item.description}... </Text>}



                                <Text style={{ fontWeight: "bold", color: "#338199" }}>{LangApp("devami")} ---{">"}</Text>
                            </View>

                        </View>
                        {/* 
                        <View style={{
                            justifyContent: "center",
                            position: "absolute", zIndex: 999,
                            backgroundColor: "white",
                            bottom: 2,
                            padding: 7,
                            borderColor: "green",
                            borderWidth: 1,
                            borderStyle: "dotted",
                            right: 2,
                            borderRadius: 8,
                            height: 27,
                            width: 108,
                            paddingRight: 5,
                            marginLeft: 10,

                        }}>
                            <PowerProgress power={item.power}></PowerProgress>
                        </View> */}
                    </TouchableOpacity>
                })}
                <View>

                </View>
            </ScrollView>}
            {loadinData && <View style={{ paddingBottom: 25, paddingTop: 15, backgroundColor: "white", width: Dimensions.get("screen").width, bottom: 1, position: "absolute", flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                <Loading></Loading>
            </View>}

            {/* Ödüllü Reklam Modal */}
            {rewardModalVisible && (
            <Modal
                visible={rewardModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}
                presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
                hardwareAccelerated={Platform.OS === 'android'}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCancel}
                            delayLongPress={()=>{return true}}
                        >
                            <MaterialCommunityIcons name="close" size={24} color="#F44336" />
                        </TouchableOpacity>
                        <View style={styles.modalHeader}>
                            <MaterialCommunityIcons name="magnify" size={32} color="#4CAF50" />
                            <Text style={styles.modalTitle}>İçeriği Görmek İzni</Text>
                        </View>
                        <Text style={styles.modalDescription}>
                            İçeriğe erişmek için reklam görüntüle
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.watchButton]}
                                onPress={handleWatchAd}
                                disabled={adLoading}
                                delayLongPress={()=>{return true}}
                            >
                                {adLoading ? (
                                    <Loading width={20} />
                                ) : (
                                    <Text style={styles.watchButtonText}>Dua Detayını Gör</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            )}
            
    
            
        </Background>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 6,
        borderRadius: 40,
        borderWidth: 1.5,
        borderColor: '#F44336',
        backgroundColor: 'transparent',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 12,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    watchButton: {
        backgroundColor: '#4CAF50',
    },
    watchButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    adCloseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: 'box-none', // Sadece buton tıklanabilir, diğer alanlar geçirgen
    },
    customCloseButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20, // iOS'ta safe area için
        right: 15,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#000000',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        zIndex: 10000,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    customCloseButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
    },
})

export default Detail;