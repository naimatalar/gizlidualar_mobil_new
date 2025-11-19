import React, { useEffect, useState, useRef } from 'react'
import {
  ActivityIndicator,
  AppState,
  Image,
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Purchases from 'react-native-purchases'
import Slider from '@react-native-community/slider'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackPlayer, { State, usePlaybackState, useProgress, useTrackPlayerEvents, Event } from 'react-native-track-player'

import LinearGradient from 'react-native-linear-gradient'
import apiConstant from '../../helpers/dataApi/apiConstant'
import { LangApp } from '../../components/Language'
import { PostAxiosAnonym } from '../../helpers/dataApi/crud'
import AbdussamedImage from '../../assets/abdussamed.jpg'
import AdmobViewBanner from '../../components/ads/AdmobViewBanner'
import { setupTrackPlayer, addTrack, playTrack, pauseTrack, stopTrack, seekTo, reset, getState } from '../../services/trackPlayerService'

const PAGE_SIZE = 500

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

function formatTime(seconds = 0) {
  const safeValue = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(safeValue / 60)
  const secs = safeValue % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const Sureler = () => {
  const navigation = useNavigation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const [activeId, setActiveId] = useState(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [playerError, setPlayerError] = useState(null)
  const [expandedMap, setExpandedMap] = useState({})
  const [hasSubscription, setHasSubscription] = useState(false)
  const [currentPlaybackState, setCurrentPlaybackState] = useState(State.None)
  const [autoPlayNext, setAutoPlayNext] = useState(false)
  const [randomPlay, setRandomPlay] = useState(false)

  const playbackState = usePlaybackState()
  const progress = useProgress(500) // Her 500ms'de bir güncelle
  const positionIntervalRef = useRef(null)
  const lastPositionRef = useRef(0) // Son pozisyonu takip et

  const audioBaseUrl = `${apiConstant.AUDIOBASEURL}/`

  function buildAudioUrl(fileName) {
    return fileName ? `${audioBaseUrl}${fileName}` : null
  }

  // TrackPlayer'ı başlat
  useEffect(() => {
    let isMounted = true

    const initPlayer = async () => {
      try {
        await setupTrackPlayer()
      } catch (initError) {
        console.warn('TrackPlayer init error:', initError)
        if (isMounted) {
          setPlayerError('Oynatıcı başlatılamadı')
        }
      }
    }

    initPlayer()

    return () => {
      isMounted = false
      reset().catch(() => null)
    }
  }, [])

  // Subscription kontrolü
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const APIKeys = {
          apple: 'appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX',
          google: 'goog_OfndwmvoPjhIPGFfcHLzfGuYPIR',
        }
        
        if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey: APIKeys.google })
        } else {
          await Purchases.configure({ apiKey: APIKeys.apple })
        }

        const customerInfo = await Purchases.getCustomerInfo()
        const isActive = customerInfo.entitlements.active['naim1016'] !== undefined
        setHasSubscription(isActive)
      } catch (error) {
        console.warn('Subscription check error in Sureler', error)
        setHasSubscription(false)
      }
    }

    checkSubscription()
  }, [])

  // AppState listener - Arka plana geçildiğinde abone değilse ses çalmayı durdur
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Abone değilse ses çalmayı durdur
        if (!hasSubscription) {
          try {
            const currentState = await getState()
            if (currentState === State.Playing) {
              await pauseTrack()
              console.log('Arka plana geçildi, abone olmadığı için ses durduruldu')
            }
          } catch (error) {
            console.warn('Background pause error', error)
          }
        }
      }
    })

    return () => {
      subscription?.remove()
    }
  }, [hasSubscription])

  // Playback state'i güncelle
  useEffect(() => {
    setCurrentPlaybackState(playbackState)
  }, [playbackState])

  // Progress kontrolü - track bittiğinde tespit et (sadece son 0.5 saniyede kontrol et)
  const trackEndedRef = useRef(false) // Track bitti mi kontrolü için flag
  useEffect(() => {
    if (activeId && progress.duration > 0 && progress.position > 0) {
      const remaining = progress.duration - progress.position
      const isNearEnd = remaining < 0.5 && remaining >= 0
      const isPlaying = currentPlaybackState === State.Playing || playbackState === State.Playing
      
      // Sadece son 0.5 saniyede ve çalıyorken kontrol et
      if (isNearEnd && isPlaying && !trackEndedRef.current) {
        trackEndedRef.current = true // Flag'i set et, tekrar tetiklenmesin
        
        console.log('Track bitti (progress kontrolü), autoPlayNext:', autoPlayNext, 'randomPlay:', randomPlay)
        
        // Kısa bir delay ile bir sonraki sureye geç
        setTimeout(() => {
          if (randomPlay && items.length > 0) {
            playRandomSure()
          } else if (autoPlayNext && items.length > 0) {
            const currentIndex = items.findIndex(item => item.id === activeId)
            if (currentIndex !== -1 && currentIndex < items.length - 1) {
              const nextItem = items[currentIndex + 1]
              console.log('Bir sonraki sure oynatılıyor (progress):', nextItem.name)
              loadAndPlay(nextItem)
            }
          }
        }, 500)
      }
      
      // Eğer pozisyon geri döndüyse (yeni track başladı) flag'i sıfırla
      if (progress.position < lastPositionRef.current) {
        trackEndedRef.current = false
      }
      
      lastPositionRef.current = progress.position
    } else if (!activeId) {
      lastPositionRef.current = 0
      trackEndedRef.current = false
    }
  }, [progress.position, progress.duration, activeId, autoPlayNext, randomPlay, items, currentPlaybackState, playbackState, playRandomSure, loadAndPlay])

  // Track bittiğinde state'i güncelle ve playback state değişikliklerini dinle
  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackState, Event.PlaybackEnded].filter(Boolean),
    async (event) => {
      if (!event || !event.type) {
        return
      }
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack == null) {
      // Track bitti
      resetPlayerState(false)
      setCurrentPlaybackState(State.None)
      
      // Rastgele oynat veya otomatik oynat kontrolü
      if (randomPlay && items.length > 0) {
        // Rastgele sure oynat aktifse yeni rastgele sure oynat
        setTimeout(() => {
          playRandomSure()
        }, 500)
      } else if (autoPlayNext && activeId && items.length > 0) {
        // Otomatik oynat aktifse bir sonraki sureyi oynat
        const currentIndex = items.findIndex(item => item.id === activeId)
        if (currentIndex !== -1 && currentIndex < items.length - 1) {
          const nextItem = items[currentIndex + 1]
          setTimeout(() => {
            loadAndPlay(nextItem)
          }, 500) // Kısa bir delay ile
        }
      }
    }
    
    if (event.type === Event.PlaybackEnded) {
      // Track tamamen bitti
      if (randomPlay && items.length > 0) {
        // Rastgele sure oynat aktifse yeni rastgele sure oynat
        setTimeout(() => {
          playRandomSure()
        }, 500)
      } else if (autoPlayNext && activeId && items.length > 0) {
        // Otomatik oynat aktifse bir sonraki sureyi oynat
        const currentIndex = items.findIndex(item => item.id === activeId)
        if (currentIndex !== -1 && currentIndex < items.length - 1) {
          const nextItem = items[currentIndex + 1]
          setTimeout(() => {
            loadAndPlay(nextItem)
          }, 500)
        }
      }
    }
    
    if (event.type === Event.PlaybackState) {
      // Playback state değiştiğinde güncelle
      // iOS'ta state güncellemesini daha agresif yap
      const newState = await getState()
      setCurrentPlaybackState(newState)
      
      // State Ended veya Stopped olduğunda track bitti demektir
      if (newState === State.Ended || newState === State.Stopped) {
        console.log('Track bitti (State.Ended/Stopped), autoPlayNext:', autoPlayNext, 'randomPlay:', randomPlay)
        
        // Rastgele oynat veya otomatik oynat kontrolü
        if (randomPlay && items.length > 0) {
          // Rastgele sure oynat aktifse yeni rastgele sure oynat
          setTimeout(() => {
            playRandomSure()
          }, 500)
        } else if (autoPlayNext && activeId && items.length > 0) {
          // Otomatik oynat aktifse bir sonraki sureyi oynat
          const currentIndex = items.findIndex(item => item.id === activeId)
          if (currentIndex !== -1 && currentIndex < items.length - 1) {
            const nextItem = items[currentIndex + 1]
            console.log('Bir sonraki sure oynatılıyor:', nextItem.name)
            setTimeout(() => {
              loadAndPlay(nextItem)
            }, 500)
          } else {
            console.log('Son sure çalındı, otomatik oynat durduruldu')
          }
        }
      }
      
      // iOS'ta ekstra bir kontrol daha yap
      if (Platform.OS === 'ios') {
        setTimeout(async () => {
          const verifiedState = await getState()
          if (verifiedState !== newState) {
            setCurrentPlaybackState(verifiedState)
          }
        }, 50)
      }
    }
  })

  async function fetchSureler() {
    if (loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const endpoint = `${apiConstant.BaseUrl}/api/Sure/GetAllMobil`
      const response = await PostAxiosAnonym(endpoint, {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
      })

      const payload = response?.data
      if (payload?.isError) {
        throw new Error(payload?.message || 'Beklenmeyen bir hata oluştu')
      }

      setItems(payload?.data?.list ?? [])
    } catch (fetchError) {
      console.warn('Sureler fetch error', fetchError)
      setError(fetchError.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSureler()
  }, [])

  function handleRefresh() {
    setRefreshing(true)
    fetchSureler()
  }

  function resetPlayerState(clearActive = true) {
    if (clearActive) {
      setActiveId(null)
    }
    setSeekValue(0)
    setIsSeeking(false)
  }

  // Rastgele sure oynat
  const playRandomSure = React.useCallback(async () => {
    if (items.length === 0) {
      return
    }
    
    try {
      const randomIndex = Math.floor(Math.random() * items.length)
      const randomItem = items[randomIndex]
      console.log('Rastgele sure oynatılıyor:', randomItem.name)
      await loadAndPlay(randomItem)
    } catch (error) {
      console.warn('playRandomSure error:', error)
      setPlayerError('Rastgele sure oynatılamadı')
    }
  }, [items, loadAndPlay])

  // Random play aktifse ve hiçbir şey çalmıyorsa rastgele sure oynat
  useEffect(() => {
    if (randomPlay && items.length > 0 && !activeId && currentPlaybackState === State.None) {
      playRandomSure()
    }
  }, [randomPlay, items.length, activeId, currentPlaybackState, playRandomSure])

  // Auto play next ve random play aynı anda aktif olamaz
  useEffect(() => {
    if (autoPlayNext && randomPlay) {
      setRandomPlay(false)
    }
  }, [autoPlayNext])

  useEffect(() => {
    if (randomPlay && autoPlayNext) {
      setAutoPlayNext(false)
    }
  }, [randomPlay])

  const loadAndPlay = React.useCallback(async (item) => {
    try {
      console.log('loadAndPlay başladı, item:', item)
      console.log('item.mp3FileName:', item.mp3FileName)
      
      const audioUrl = buildAudioUrl(item.mp3FileName)
      console.log('buildAudioUrl sonucu:', audioUrl)
      
      if (!audioUrl) {
        throw new Error('Ses dosyası bulunamadı - mp3FileName eksik veya null')
      }

      setPlayerError(null)
      setIsPreparing(true)
      setActiveId(item.id)
      setSeekValue(0)

      // Önce mevcut track'leri temizle
      console.log('TrackPlayer reset ediliyor...')
      await reset()

      // Yeni track ekle
      const trackData = {
        id: String(item.id),
        url: audioUrl,
        title: item.name,
        artist: 'Abdussamed Kıraatleri',
        artwork: undefined,
      }
      console.log('Track ekleniyor:', trackData)
      await addTrack(trackData)
      console.log('Track eklendi, çalmaya başlanıyor...')

      // Çalmaya başla
      await playTrack()
      console.log('playTrack() çağrıldı')
      
      const stateAfterPlay = await getState()
      console.log('Play sonrası state:', stateAfterPlay)
      
      setCurrentPlaybackState(State.Playing)
      setIsPreparing(false)
      // iOS'ta state güncellemesini garanti etmek için
      if (Platform.OS === 'ios') {
        setTimeout(async () => {
          const updatedState = await getState()
          console.log('iOS state güncelleme (150ms sonra):', updatedState)
          setCurrentPlaybackState(updatedState)
        }, 150)
      }
    } catch (loadError) {
      console.error('loadAndPlay error:', loadError)
      console.error('loadAndPlay error stack:', loadError?.stack)
      const fallback = LangApp('sesCalmaHatasi') || 'Ses çalma hatası'
      setPlayerError(loadError?.message ? `${fallback}: ${loadError.message}` : fallback)
      resetPlayerState()
      setCurrentPlaybackState(State.None)
      setIsPreparing(false)
    }
  }, [])

  async function handlePlayPress(item) {
    try {
      console.log('handlePlayPress çağrıldı, item:', item)
      const currentState = await getState()
      console.log('Mevcut state:', currentState)
      const isCurrentTrack = activeId === item.id
      console.log('isCurrentTrack:', isCurrentTrack, 'activeId:', activeId, 'item.id:', item.id)

      if (isCurrentTrack && (currentState === State.Playing || currentPlaybackState === State.Playing || playbackState === State.Playing)) {
        // Duraklat
        await pauseTrack()
        // State'i hemen güncelle - iOS için önemli
        setCurrentPlaybackState(State.Paused)
        // iOS'ta state güncellemesini garanti etmek için kısa bir delay sonra tekrar kontrol et
        if (Platform.OS === 'ios') {
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 100)
        }
      } else if (isCurrentTrack && (currentState === State.Paused || currentState === State.Ready || currentPlaybackState === State.Paused || currentPlaybackState === State.Ready || playbackState === State.Paused || playbackState === State.Ready)) {
        // Devam ettir
        await playTrack()
        // State'i hemen güncelle - iOS için önemli
        setCurrentPlaybackState(State.Playing)
        // iOS'ta state güncellemesini garanti etmek için kısa bir delay sonra tekrar kontrol et
        if (Platform.OS === 'ios') {
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 100)
        }
      } else {
        // Yeni track yükle ve çal
        // loadAndPlay içinde zaten state güncelleniyor
        await loadAndPlay(item)
        // iOS'ta state güncellemesini garanti etmek için
        if (Platform.OS === 'ios') {
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 200)
        }
      }
    } catch (playError) {
      console.warn('handlePlayPress error', playError)
      setPlayerError(LangApp('sesCalmaHatasi') || 'Ses çalma hatası')
    }
  }

  async function handleStopPress(item) {
    if (activeId !== item.id) {
      return
    }
    try {
      await stopTrack()
      await seekTo(0)
      setCurrentPlaybackState(State.Stopped)
      resetPlayerState(false)
    } catch (stopError) {
      console.warn('handleStopPress error', stopError)
    }
  }

  async function handleSeekBy(item, delta) {
    if (activeId !== item.id) {
      return
    }
    try {
      const currentPos = progress.position
      const duration = progress.duration
      let target = currentPos + delta

      if (duration > 0) {
        target = Math.min(Math.max(target, 0), duration)
      } else {
        target = Math.max(target, 0)
      }

      await seekTo(target)
      setSeekValue(target)
    } catch (seekError) {
      console.warn('handleSeekBy error', seekError)
    }
  }

  function handleSeekStart() {
    setIsSeeking(true)
  }

  function handleSeekChange(value) {
    setSeekValue(value)
  }

  async function handleSeekComplete(value) {
    if (activeId == null) {
      setIsSeeking(false)
      return
    }
    try {
      await seekTo(value)
      setSeekValue(value)
    } catch (seekError) {
      console.warn('handleSeekComplete error', seekError)
    } finally {
      setIsSeeking(false)
    }
  }

  function toggleDescription(id) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <LinearGradient colors={['#004d40', '#00bfa5', '#7e57c2']} style={styles.gradient}>
      <View style={styles.screen}>
        <View style={styles.hero}>
          <Image source={AbdussamedImage} style={styles.heroImage} />
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>{LangApp('sureler') || 'Sureler'}</Text>
            <Text style={styles.heroSubtitle}>{'Abdussamed Kıraatleri'}</Text>
          </View>
        </View>
        
        {!hasSubscription ? (
          <TouchableOpacity delayLongPress={()=>{return true}  }  
            onPress={() => {
              navigation.navigate('RemoveAds')
            }}
            activeOpacity={0.7}
            style={styles.backgroundPlayTextButton}
          >
            <MaterialCommunityIcons
              name="play"
              size={16}
              color="#FFFFFF"
              style={styles.backgroundPlayIcon}
            />
            <Text style={styles.backgroundPlayText}>Arkaplanda Çal Özelliğini Aç</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backgroundPlayActive}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#2E7D32"
              style={styles.backgroundPlayIcon}
            />
            <Text style={styles.backgroundPlayActiveText}>Arka Planda Çalma Özelliği Aktif</Text>
          </View>
        )}

        {/* Switch'ler */}
        <View style={styles.switchesContainer}>
          <View style={styles.switchRow}>
            <View style={styles.switchItem}>
              <MaterialCommunityIcons name="skip-next" size={18} color="#311B92" style={styles.switchIcon} />
              <Text style={styles.switchLabel}>Otomatik Oynat</Text>
              <Switch
                value={autoPlayNext}
                onValueChange={setAutoPlayNext}
                trackColor={{ false: '#E0E0E0', true: '#4A148C' }}
                thumbColor={autoPlayNext ? '#FFFFFF' : '#9E9E9E'}
              />
            </View>
            
            <View style={styles.switchItem}>
              <MaterialCommunityIcons name="shuffle" size={18} color="#311B92" style={styles.switchIcon} />
              <Text style={styles.switchLabel}>Rastgele Oynat</Text>
              <Switch
                value={randomPlay}
                onValueChange={(value) => {
                  setRandomPlay(value)
                  // Eğer açılıyorsa ve hiçbir şey çalmıyorsa hemen rastgele sure oynat
                  if (value && items.length > 0 && !activeId) {
                    playRandomSure()
                  }
                }}
                trackColor={{ false: '#E0E0E0', true: '#4A148C' }}
                thumbColor={randomPlay ? '#FFFFFF' : '#9E9E9E'}
              />
            </View>
          </View>
        </View>
        
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4A148C']}
              tintColor='#4A148C'
            />
          }
        > 
           
          {loading && items.length === 0 ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator color='#4A148C' size='small' />
            </View>
          ) : null}

          {!loading && items.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <MaterialCommunityIcons name='music-note-off' size={38} color='#9E9E9E' />
              <Text style={styles.emptyText}>{LangApp('kayitBulunamadi')}</Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          ) : null} 

          {items.map((item) => {
            const isCurrent = activeId === item.id
            // Playback state kontrolü - önce currentPlaybackState, sonra playbackState hook'u, son olarak getState ile kontrol
            const isPlaying = isCurrent && (
              currentPlaybackState === State.Playing || 
              playbackState === State.Playing
            )
            const isBuffering = isCurrent && (
              currentPlaybackState === State.Loading || 
              currentPlaybackState === State.Buffering || 
              playbackState === State.Loading || 
              playbackState === State.Buffering
            )
            const shownPosition = isCurrent ? (isSeeking ? seekValue : progress.position) : 0
            const shownDuration = isCurrent ? progress.duration : 0
            const sliderMax = shownDuration > 0 ? shownDuration : Math.max(shownPosition, 1)
            const controlsDisabled = !isCurrent || isPreparing
            const isExpanded = Boolean(expandedMap[item.id])

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  isCurrent ? styles.cardActive : null,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
             
                <View style={styles.controlsRow}>
                  <TouchableOpacity delayLongPress={()=>{return true}  }  
                    onPress={() => handleSeekBy(item, -10)}
                    style={[styles.controlButton, (controlsDisabled || isBuffering) && styles.controlDisabled]}
                    disabled={controlsDisabled || isBuffering}
                  >
                    <MaterialCommunityIcons
                      name='rewind-10'
                      size={18}
                      color={controlsDisabled || isBuffering ? '#B0BEC5' : '#4A148C'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePlayPress(item)}
                    style={[
                      styles.playButton,
                      isCurrent && isPlaying ? styles.playButtonActive : null,
                    ]}
                    disabled={isPreparing}
                    delayLongPress={()=>{return true}  }  
                  >
                    {isPreparing && isCurrent ? (
                      <ActivityIndicator color='#FFFFFF' size='small' />
                    ) : (
                      <MaterialCommunityIcons
                        name={isCurrent && isPlaying ? 'pause' : 'play'}
                        size={22}
                        color={isCurrent && isPlaying ? '#FFFFFF' : '#4A148C'}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity delayLongPress={()=>{return true}  }  
                    onPress={() => handleStopPress(item)}
                    style={[styles.controlButton, controlsDisabled && styles.controlDisabled]}
                    disabled={controlsDisabled}
                  >
                    <MaterialCommunityIcons
                      name='stop'
                      size={18}
                      color={controlsDisabled ? '#B0BEC5' : '#4A148C'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity delayLongPress={()=>{return true}  }  
                    onPress={() => handleSeekBy(item, 10)}
                    style={[styles.controlButton, (controlsDisabled || isBuffering) && styles.controlDisabled]}
                    disabled={controlsDisabled || isBuffering}
                  >
                    <MaterialCommunityIcons
                      name='fast-forward-10'
                      size={18}
                      color={controlsDisabled || isBuffering ? '#B0BEC5' : '#4A148C'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.sliderRow}>
                  <Text style={styles.timeText}>{formatTime(shownPosition)}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={sliderMax}
                    value={isCurrent ? (isSeeking ? seekValue : progress.position) : 0}
                    onSlidingStart={handleSeekStart}
                    onValueChange={handleSeekChange}
                    onSlidingComplete={handleSeekComplete}
                    minimumTrackTintColor='#4A148C'
                    maximumTrackTintColor='#D1C4E9'
                    thumbTintColor='#4A148C'
                    disabled={!isCurrent}
                  />
                  <Text style={styles.timeText}>{formatTime(shownDuration)}</Text>
                </View>

                {!!item.description ? (
                  <>
                    <TouchableOpacity delayLongPress={()=>{return true}  }  
                      onPress={() => toggleDescription(item.id)}
                      style={styles.collapseToggle}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color='#4A148C'
                      />
                      <Text style={styles.collapseLabel}>{LangApp('aciklama') || 'Açıklama'}</Text>
                    </TouchableOpacity>
                    {isExpanded ? <Text style={styles.cardSubtitle}>{item.description}</Text> : null}
                  </>
                ) : null}

                {playerError && isCurrent ? <Text style={styles.errorInline}>{playerError}</Text> : null}
              </View>
            )
          })}
        </ScrollView>
       
      </View>
      <AdmobViewBanner
                  iosAdUnitId="ca-app-pub-8795169628743262/9326945854"   // iOS için unit ID
                  androidAdUnitId="ca-app-pub-8795169628743262/4266190864" // Android için gerçek unit ID
                  bannerSize="SMART_BANNER" // İstersen 'BANNER', 'LARGE_BANNER' vs. de verebilirsin
                  style={{ alignItems: 'center', paddingVertical: 4 }}
                />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
    paddingTop:0

  
  },
  gradient: {
    flex: 1,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  heroTextWrapper: {
    marginLeft: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#EDE7F6',
  },
  scroll: {
    flex: 1,

  },
  scrollContent: {
    paddingBottom: 1,
  },
  loadingWrapper: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyWrapper: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#4A148C',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#311B92',
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#546E7A',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 41,
    height: 41,
    borderRadius: 20.5,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: {
    backgroundColor: '#ECEFF1',
  },
  playButton: {
    width: 53,
    height: 53,
    borderRadius: 26.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1C4E9',
  },
  playButtonActive: {
    backgroundColor: '#4A148C',
    borderColor: '#4A148C',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  timeText: {
    width: 52,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    color: '#37474F',
  },
  collapseToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  collapseLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4A148C',
    fontWeight: '500',
  },
  errorInline: {
    marginTop: 12,
    fontSize: 13,
    color: '#D32F2F',
  },
  backgroundPlayTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#5E35B1',
    borderRadius: 10,
  },
  backgroundPlayIcon: {
    marginRight: 6,
  },
  backgroundPlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
   
  },
  backgroundPlayActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  backgroundPlayActiveText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '600',
  },
  switchesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  switchIcon: {
    marginRight: 2,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#311B92',
    flex: 1,
  },
})

export default Sureler

