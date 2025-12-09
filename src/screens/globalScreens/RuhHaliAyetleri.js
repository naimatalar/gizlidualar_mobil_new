import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Purchases from 'react-native-purchases'
import Slider from '@react-native-community/slider'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackPlayer, { State, usePlaybackState, useProgress, useTrackPlayerEvents, Event } from 'react-native-track-player'
import LinearGradient from 'react-native-linear-gradient'
import Animated from 'react-native/Libraries/Animated/Animated'
import apiConstant from '../../helpers/dataApi/apiConstant'
import { LangApp } from '../../components/Language'
import { matchAyet } from '../../helpers/dataApi/prescriptionService'
import { setupTrackPlayer, addTrack, playTrack, pauseTrack, stopTrack, seekTo, reset, getState } from '../../services/trackPlayerService'
import AdmobViewBanner from '../../components/ads/AdmobViewBanner'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PAGE_SIZE = 500
const analysisTagSamples = ['huzur', 'uyku', 'para', 'bereket', 'mutluluk', 'şifa', 'bolluk', 'umut', 'bereket', 'denge', 'sabır']

function formatTime(seconds = 0) {
  const safeValue = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(safeValue / 60)
  const secs = safeValue % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const AnalysisModal = ({ visible, desireText }) => {
  const [pairs, setPairs] = useState([])
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      ).start()
    } else {
      opacity.stopAnimation()
      opacity.setValue(0)
    }
    return () => opacity.stopAnimation()
  }, [visible, opacity])

  useEffect(() => {
    if (!visible) {
      setPairs([])
      return
    }
    const userWords = desireText
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean)
    let wordIndex = 0
    let tagIndex = 0
    setPairs([])
    const interval = setInterval(() => {
      const userWord = userWords[wordIndex] || desireText
      const tagWord = analysisTagSamples[tagIndex % analysisTagSamples.length]
      setPairs((prev) => {
        const next = [...prev, { id: Date.now(), userWord, tagWord }]
        return next.slice(-8)
      })
      wordIndex = (wordIndex + 1) % Math.max(userWords.length, 1)
      tagIndex += 1
    }, 400)
    return () => clearInterval(interval)
  }, [visible, desireText])

  if (!visible) {
    return null
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.analysisBackdrop}>
        <View style={styles.analysisContent}>
          <Animated.View style={[styles.analysisPulse, { opacity }]} />
          <MaterialCommunityIcons name="robot-happy" size={36} color="#FFF" style={styles.analysisIcon} />
          <Text style={styles.analysisTitle}>Analiz ediliyor...</Text>
          <Text style={styles.analysisSubtitle}>
            Yazdıkların, sistemdeki ayet etiketleri ve açıklamaları ile eşleştiriliyor.
          </Text>
          <View style={styles.analysisStream}>
            {pairs.map((pair) => (
              <View key={pair.id} style={styles.analysisRow}>
                <Text style={styles.analysisUserText}>{pair.userWord}</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#FFAB40" />
                <Text style={styles.analysisTagText}>{pair.tagWord}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const RuhHaliAyetleri = () => {
  const navigation = useNavigation()
  const [moodText, setMoodText] = useState('')
  const [loading, setLoading] = useState(false)
  const [matchedAyet, setMatchedAyet] = useState(null)
  const [analysisVisible, setAnalysisVisible] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  const [isPreparing, setIsPreparing] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [playerError, setPlayerError] = useState(null)
  const [currentPlaybackState, setCurrentPlaybackState] = useState(State.None)

  const playbackState = usePlaybackState()
  const progress = useProgress(500) // Her 500ms'de bir güncelle

  const audioBaseUrl = `${apiConstant.AUDIOBASEURL}/`

  const [backgroundPlayControl, setBackgroundPlayControl] = useState("true")
  useEffect(() => {
    const getBackgroundPlayControl = async () => {

      const bc = await AsyncStorage.getItem("backgroundPlay")
      setBackgroundPlayControl(bc)
    } 
    getBackgroundPlayControl()
  }, [backgroundPlayControl])

  function buildAudioUrl(fileName) {
    return fileName ? `${audioBaseUrl}${fileName}` : null
  }


    useEffect(() => {
      if (backgroundPlayControl == "false") {
        
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
          if (nextAppState === 'background' || nextAppState === 'inactive') {
            // Abone değilse ses çalmayı durdur
            
            if (!hasSubscription) {
              console.log(hasSubscription)
              try {
                const currentState = await getState()
                if (currentState === State.Playing) {
                  await pauseTrack()
                  setCurrentPlaybackState(State.None)
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
      }
     
    }, [hasSubscription,backgroundPlayControl])
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
        console.warn('Subscription check error in RuhHaliAyetleri', error)
        setHasSubscription(false)
      }
    }

    checkSubscription()
  }, [])

  // Playback state'i güncelle
  useEffect(() => {
    setCurrentPlaybackState(playbackState)
  }, [playbackState])

  // iOS'ta state güncellemesini periyodik olarak kontrol et
  useEffect(() => {
    if (Platform.OS === 'ios' && matchedAyet) {
      const interval = setInterval(async () => {
        try {
          const currentState = await getState()
          setCurrentPlaybackState(currentState)
        } catch (error) {
          console.warn('iOS state check error', error)
        }
      }, 200) // Her 200ms'de bir kontrol et

      return () => clearInterval(interval)
    }
  }, [matchedAyet])

  // Track bittiğinde state'i güncelle
  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackState].filter(Boolean),
    async (event) => {
      if (!event || !event.type) {
        return
      }
      if (event.type === Event.PlaybackTrackChanged && event.nextTrack == null) {
        // Track bitti
        resetPlayerState()
        setCurrentPlaybackState(State.None)
      }
      if (event.type === Event.PlaybackState) {
        // Playback state değiştiğinde güncelle
        // iOS'ta state güncellemesini daha agresif yap
        const newState = await getState()
        setCurrentPlaybackState(newState)
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

  function resetPlayerState() {
    setSeekValue(0)
    setIsSeeking(false)
    setIsPreparing(false)
  }

  async function loadAndPlay(audioUrl) {
    try {
      if (!audioUrl) {
        throw new Error('Ses dosyası bulunamadı')
      }

      setPlayerError(null)
      setIsPreparing(true)
      setSeekValue(0)

      // Önce mevcut track'leri temizle
      await reset()

      // Yeni track ekle
      await addTrack({
        id: 'ruh-hali-ayet',
        url: audioUrl,
        title: matchedAyet?.title || 'Ayet',
        artist: 'Ruh Hali Ayetleri',
        artwork: undefined,
      })

      // Çalmaya başla
      await playTrack()
      setCurrentPlaybackState(State.Playing)
      setIsPreparing(false)
      // iOS'ta state güncellemesini garanti etmek için
      if (Platform.OS === 'ios') {
        setTimeout(async () => {
          const updatedState = await getState()
          setCurrentPlaybackState(updatedState)
        }, 150)
      }
    } catch (loadError) {
      console.warn('loadAndPlay error', loadError)
      const fallback = LangApp('sesCalmaHatasi') || 'Ses çalma hatası'
      setPlayerError(loadError?.message ? `${fallback}: ${loadError.message}` : fallback)
      resetPlayerState()
      setCurrentPlaybackState(State.None)
      setIsPreparing(false)
    }
  }

  async function handlePlayPress() {
    if (!matchedAyet || !matchedAyet.audioUrl) {
      Alert.alert('Hata', 'Önce uygun ayeti bulun')
      return
    }

    try {
      const currentState = await getState()
      const isPlaying = currentState === State.Playing || currentPlaybackState === State.Playing || playbackState === State.Playing

      if (isPlaying) {
        // Duraklat
        await pauseTrack()
        setCurrentPlaybackState(State.Paused)
        // iOS'ta state güncellemesini garanti etmek için birden fazla kontrol yap
        if (Platform.OS === 'ios') {
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 50)
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 150)
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 300)
        }
      } else if (currentState === State.Paused || currentState === State.Ready || currentPlaybackState === State.Paused || currentPlaybackState === State.Ready || playbackState === State.Paused || playbackState === State.Ready) {
        // Devam ettir
        await playTrack()
        setCurrentPlaybackState(State.Playing)
        // iOS'ta state güncellemesini garanti etmek için birden fazla kontrol yap
        if (Platform.OS === 'ios') {
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 50)
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 150)
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 300)
        }
      } else {
        // Yeni track yükle ve çal
        const audioUrl = buildAudioUrl(matchedAyet.audioUrl)
        await loadAndPlay(audioUrl)
        // iOS'ta state güncellemesini garanti etmek için
        if (Platform.OS === 'ios') {
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 100)
          setTimeout(async () => {
            const updatedState = await getState()
            setCurrentPlaybackState(updatedState)
          }, 250)
        }
      }
    } catch (playError) {
      console.warn('handlePlayPress error', playError)
      setPlayerError(LangApp('sesCalmaHatasi') || 'Ses çalma hatası')
    }
  }

  async function handleStopPress() {
    try {
      await stopTrack()
      await seekTo(0)
      setCurrentPlaybackState(State.Stopped)
      resetPlayerState()
    } catch (stopError) {
      console.warn('handleStopPress error', stopError)
    }
  }

  async function handleSeekBy(delta) {
    try {
      const currentPosition = progress.position
      const currentDuration = progress.duration
      let target = currentPosition + delta

      if (currentDuration > 0) {
        target = Math.min(Math.max(target, 0), currentDuration)
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
    try {
      await seekTo(value)
      setSeekValue(value)
    } catch (seekError) {
      console.warn('handleSeekComplete error', seekError)
    } finally {
      setIsSeeking(false)
    }
  }

  async function handleMatchAyet() {
    const trimmedText = moodText.trim()
    if (!trimmedText) {
      Alert.alert('Uyarı', 'Lütfen ruh halinizi yazın')
      return
    }

    setLoading(true)
    setMatchedAyet(null)
    resetPlayerState()

    // TrackPlayer'ı durdur ve temizle
    try {
      await stopTrack()
      await reset()
      setCurrentPlaybackState(State.None)
    } catch (error) {
      console.warn('TrackPlayer reset error', error)
    }

    setAnalysisVisible(true)

    // Loading'i garanti etmek için setTimeout kullan
    let loadingTimeout = setTimeout(() => {
      console.warn('handleMatchAyet: Loading timeout - forcing loading to false')
      setAnalysisVisible(false)
      setLoading(false)
    }, 35000) // 35 saniye sonra zorla kapat

    const cleanup = () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        loadingTimeout = null
      }
      setAnalysisVisible(false)
      setLoading(false)
    }

    try {
      console.log('handleMatchAyet: Starting match...')

      // Önce 4 saniye bekle (analiz animasyonu için)
      await new Promise((resolve) => setTimeout(resolve, 4000))

      // Timeout ile güvenli hale getir
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('İstek zaman aşımına uğradı')), 25000)
      )

      console.log('handleMatchAyet: Calling matchAyet...')
      const matchPromise = matchAyet(trimmedText).catch((err) => {
        console.error('handleMatchAyet: matchAyet promise rejected:', err)
        throw err
      })

      const result = await Promise.race([matchPromise, timeoutPromise])

      console.log('handleMatchAyet: Match result:', result)

      if (result && typeof result === 'object' && result.audioUrl) {
        setMatchedAyet(result)
        console.log('handleMatchAyet: Matched ayet set successfully')
      } else {
        console.warn('handleMatchAyet: No result returned or invalid result:', result)
        Alert.alert('Hata', 'Uygun ayet bulunamadı')
      }
    } catch (error) {
      console.error('handleMatchAyet error:', error)
      console.error('handleMatchAyet error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        stack: error?.stack,
      })
      Alert.alert('Hata', `Ayet eşleştirme sırasında bir hata oluştu: ${error?.message || 'Bilinmeyen hata'}`)
    } finally {
      console.log('handleMatchAyet: Finally block - cleaning up')
      cleanup()
    }
  }

  return (
    <>
      <LinearGradient colors={['#004d40', '#00bfa5', '#7e57c2']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
 

            {backgroundPlayControl == "false" && <View>


              {!hasSubscription && (
                <TouchableOpacity
                  delayLongPress={() => { return true }}
                  style={styles.backgroundPlayButton}
                  onPress={() => {
                    navigation.navigate('RemoveAds')
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="play"
                    size={20}
                    color="#FFFFFF"
                    style={styles.backgroundPlayIcon}
                  />
                  <Text style={styles.backgroundPlayText}>Arka Planda Dinleme özelliğini Aktif et</Text>
                </TouchableOpacity>
              )}</View>}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ruh Halinizi Yazın</Text>
              <Text style={styles.cardSubtitle}>
                Ruh halinizi, isteklerinizi veya arzularınızı yazın. Size en uygun ayeti bulalım.
              </Text>

              <View style={styles.aiInfoContainer}>
                <MaterialCommunityIcons name="robot" size={16} color="#4A148C" />
                <Text style={styles.aiInfoText}>
                  Yapay zeka ile yazdıklarınıza göre ruh halinize en uygun ayeti otomatik olarak belirliyoruz.
                </Text>
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="Örn: Huzursuzum, uyuyamıyorum, içimde bir sıkıntı var..."
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
                value={moodText}
                onChangeText={setMoodText}
                textAlignVertical="top"
              />

              <TouchableOpacity
                delayPressOut={() => { return true }}
                style={[styles.matchButton, loading && styles.matchButtonDisabled]}
                onPress={handleMatchAyet}
                disabled={loading}

              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="headphones" size={20} color="#FFFFFF" />
                    <Text style={styles.matchButtonText}>Uygun Ayeti Dinle</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {matchedAyet && (
              <View style={styles.playerCard}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerTitle}>{matchedAyet.title || 'Ayet'}</Text>
                  {matchedAyet.description && (
                    <Text style={styles.playerDescription}>{matchedAyet.description}</Text>
                  )}
                </View>

                {(() => {
                  // iOS'ta periyodik kontrol sayesinde currentPlaybackState güncel olmalı
                  const isPlaying = currentPlaybackState === State.Playing || playbackState === State.Playing
                  const isBuffering = currentPlaybackState === State.Loading || currentPlaybackState === State.Buffering || playbackState === State.Loading || playbackState === State.Buffering
                  const shownPosition = isSeeking ? seekValue : progress.position
                  const shownDuration = progress.duration
                  const sliderMax = shownDuration > 0 ? shownDuration : Math.max(shownPosition, 1)

                  return (
                    <>
                      <View style={styles.controlsRow}>
                        <TouchableOpacity delayLongPress={() => { return true }}
                          onPress={() => handleSeekBy(-10)}
                          style={[styles.controlButton, (isPreparing || isBuffering) && styles.controlDisabled]}
                          disabled={isPreparing || isBuffering}
                        >
                          <MaterialCommunityIcons
                            name="rewind-10"
                            size={22}
                            color={isPreparing || isBuffering ? '#B0BEC5' : '#4A148C'}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          delayPressOut={() => { return true }}
                          onPress={handlePlayPress}
                          style={[styles.playButton, isPlaying && styles.playButtonActive]}
                          disabled={isPreparing}
                          delayLongPress={() => { return true }}
                        >
                          {isPreparing ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                          ) : (
                            <MaterialCommunityIcons
                              name={isPlaying ? 'pause' : 'play'}
                              size={26}
                              color={isPlaying ? '#FFFFFF' : '#4A148C'}
                            />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity delayLongPress={() => { return true }}
                          onPress={handleStopPress}
                          style={[styles.controlButton, isPreparing && styles.controlDisabled]}
                          disabled={isPreparing}
                        >
                          <MaterialCommunityIcons
                            name="stop"
                            size={22}
                            color={isPreparing ? '#B0BEC5' : '#4A148C'}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity delayLongPress={() => { return true }}
                          onPress={() => handleSeekBy(10)}
                          style={[styles.controlButton, (isPreparing || isBuffering) && styles.controlDisabled]}
                          disabled={isPreparing || isBuffering}
                        >
                          <MaterialCommunityIcons
                            name="fast-forward-10"
                            size={22}
                            color={isPreparing || isBuffering ? '#B0BEC5' : '#4A148C'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.sliderRow}>
                        <Text style={styles.timeText}>{formatTime(shownPosition)}</Text>
                        <Slider
                          style={styles.slider}
                          minimumValue={0}
                          maximumValue={sliderMax}
                          value={shownPosition}
                          onSlidingStart={handleSeekStart}
                          onValueChange={handleSeekChange}
                          onSlidingComplete={handleSeekComplete}
                          minimumTrackTintColor="#4A148C"
                          maximumTrackTintColor="#D1C4E9"
                          thumbTintColor="#4A148C"
                          disabled={isPreparing}
                        />
                        <Text style={styles.timeText}>{formatTime(shownDuration)}</Text>
                      </View>
                    </>
                  )
                })()}

                {playerError && <Text style={styles.errorInline}>{playerError}</Text>}
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <AdmobViewBanner
        iosAdUnitId="ca-app-pub-8795169628743262/9326945854"   // iOS için unit ID
        androidAdUnitId="ca-app-pub-8795169628743262/4266190864" // Android için gerçek unit ID
        bannerSize="SMART_BANNER" // İstersen 'BANNER', 'LARGE_BANNER' vs. de verebilirsin
        style={{ alignItems: 'center', paddingVertical: 4 }}
      />
      <AnalysisModal visible={analysisVisible} desireText={moodText} />
    </>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#311B92',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 12,
    lineHeight: 20,
  },
  aiInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  aiInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#4A148C',
    lineHeight: 18,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1C4E9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#311B92',
    minHeight: 100,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A148C',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  matchButtonDisabled: {
    opacity: 0.6,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#4A148C',
  },
  playerHeader: {
    marginBottom: 16,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#311B92',
    marginBottom: 8,
  },
  playerDescription: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: {
    backgroundColor: '#ECEFF1',
  },
  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
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
  errorInline: {
    marginTop: 12,
    fontSize: 13,
    color: '#D32F2F',
  },
  analysisBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  analysisContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1A237E',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  analysisPulse: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  analysisIcon: {
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analysisSubtitle: {
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 18,
  },
  analysisStream: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  analysisUserText: {
    flex: 1,
    fontSize: 13,
    color: '#FFECB3',
    marginRight: 8,
  },
  analysisTagText: {
    flex: 0.8,
    fontSize: 13,
    color: '#FFAB40',
    textAlign: 'right',
    fontWeight: '600',
  },
  backgroundPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A5ACD', // Morumsu mavi renk
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backgroundPlayIcon: {
    marginRight: 8,
  },
  backgroundPlayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})

export default RuhHaliAyetleri

