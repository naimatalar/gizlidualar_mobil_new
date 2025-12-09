import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  findNodeHandle,
  Dimensions
} from 'react-native'
import { Audio } from 'expo-av'
import Background from '../../components/Background'
import apiConstant from '../../helpers/dataApi/apiConstant'
import { GetAxios, PostAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud'
import { LinearGradient } from 'expo-linear-gradient'
import { DeviceLanguage, LangApp } from '../../components/Language'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AdmobViewBanner from '../../components/ads/AdmobViewBanner'
import CreateEntry from './CreateEntry'
import Slider from '@react-native-community/slider'

const { width } = Dimensions.get('window')

function formatTime(seconds = 0) {
  const safeValue = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(safeValue / 60)
  const secs = safeValue % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function DiscoverDetail(props) {
  const { itemId, targetEntryId } = props.route.params || {}
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createEntryModalVisible, setCreateEntryModalVisible] = useState(false)
  const [replyEntry, setReplyEntry] = useState(null)
  const scrollViewRef = useRef(null)
  const entryRefs = useRef({})
  const highlightTimeoutRef = useRef(null)
  const [highlightedEntryId, setHighlightedEntryId] = useState(null)
  const [pendingEntryId, setPendingEntryId] = useState(targetEntryId || null)
  const ENTRY_PAGE_SIZE = 10
  const [entries, setEntries] = useState([])
  const [entryTotalCount, setEntryTotalCount] = useState(0)
  const [entriesPageNumber, setEntriesPageNumber] = useState(1)
  const [entriesHasMore, setEntriesHasMore] = useState(true)
  const [entriesLoadingMore, setEntriesLoadingMore] = useState(false)

  // Audio player states
  const [sound, setSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackStatus, setPlaybackStatus] = useState(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)

  useEffect(() => {
    getItemDetail('initial')
    return () => {
      // Cleanup audio on unmount
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [itemId])

  // Audio playback status listener
  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate((status) => {
        setPlaybackStatus(status)
        setIsPlaying(status.isPlaying)
      })
    }
  }, [sound])

  const fetchEntries = async (page = 1, mode = 'initial') => {
    try {
      if (mode === 'loadMore') {
        setEntriesLoadingMore(true)
      }

      if (page === 1) {
        entryRefs.current = {}
      }

      // TODO: Backend'de bu endpoint oluşturulacak
      const endpoint = apiConstant.BaseUrl + '/api/discover/GetEntries'
      const response = await PostAxiosAnonym(endpoint, {
        ItemId: itemId,
        PageNumber: page,
        PageSize: ENTRY_PAGE_SIZE
      })

      if (response.data && response.data.data) {
        const pageData = response.data.data
        const list = pageData.list || []
        const totalCount = pageData.totalCount ?? pageData.TotalCount ?? null

        setEntries((prevEntries) => (page === 1 ? list : [...prevEntries, ...list]))
        setEntriesPageNumber(page)
        setEntryTotalCount((prev) => {
          if (typeof totalCount === 'number') {
            return totalCount
          }
          if (page === 1) {
            return list.length
          }
          return prev + list.length
        })

        const hasMore = typeof totalCount === 'number'
          ? page * ENTRY_PAGE_SIZE < totalCount
          : list.length === ENTRY_PAGE_SIZE

        setEntriesHasMore(hasMore)
      }
    } catch (error) {
      console.warn('Entries yüklenirken hata:', error)
    } finally {
      if (mode === 'loadMore') {
        setEntriesLoadingMore(false)
      }
    }
  }

  const getItemDetail = async (mode = 'initial') => {
    try {
      if (mode === 'refresh') {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      entryRefs.current = {}
      setEntries([])
      setEntriesPageNumber(1)
      setEntriesHasMore(true)

      // TODO: Backend'de bu endpoint oluşturulacak
      const endpoint = apiConstant.BaseUrl + `/api/discover/GetById/${itemId}`
      const response = await GetAxios(endpoint)

      if (response.data && response.data.data) {
        setItem(response.data.data)
        setEntryTotalCount(response.data.data.commentCount || 0)
        await fetchEntries(1, 'initial')
      } else {
        setItem(null)
        setEntryTotalCount(0)
        setEntries([])
      }
    } catch (error) {
      console.warn('Item detay yüklenirken hata:', error)
      Alert.alert('Hata', 'İçerik yüklenirken bir hata oluştu')
    } finally {
      if (mode === 'refresh') {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Audio player functions
  const loadAudio = async (audioUrl) => {
    try {
      setIsLoadingAudio(true)
      
      // Stop and unload previous sound if exists
      if (sound) {
        await sound.unloadAsync()
        setSound(null)
      }

      // Ses dosyası URL'ini oluştur
      const fullAudioUrl = audioUrl.startsWith('http') 
        ? audioUrl 
        : `${apiConstant.AUDIOBASEURL}/${audioUrl}`

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullAudioUrl },
        { shouldPlay: false }
      )
      
      setSound(newSound)
      setIsLoadingAudio(false)
    } catch (error) {
      console.warn('Audio yükleme hatası:', error)
      Alert.alert('Hata', 'Ses dosyası yüklenemedi')
      setIsLoadingAudio(false)
    }
  }

  const playAudio = async () => {
    if (!item?.audioUrl) {
      Alert.alert('Uyarı', 'Ses dosyası bulunamadı')
      return
    }

    try {
      if (!sound) {
        await loadAudio(item.audioUrl)
        // Wait a bit for sound to be ready
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (sound) {
        const status = await sound.getStatusAsync()
        if (status.isLoaded) {
          if (status.didJustFinish) {
            // Restart if finished
            await sound.replayAsync()
          } else {
            await sound.playAsync()
          }
        }
      }
    } catch (error) {
      console.warn('Audio çalma hatası:', error)
      Alert.alert('Hata', 'Ses çalınamadı')
    }
  }

  const pauseAudio = async () => {
    try {
      if (sound) {
        await sound.pauseAsync()
      }
    } catch (error) {
      console.warn('Audio duraklatma hatası:', error)
    }
  }

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync()
        await sound.setPositionAsync(0)
      }
    } catch (error) {
      console.warn('Audio durdurma hatası:', error)
    }
  }

  const seekAudio = async (position) => {
    try {
      if (sound) {
        await sound.setPositionAsync(position * 1000) // Convert to milliseconds
      }
    } catch (error) {
      console.warn('Audio seek hatası:', error)
    }
  }

  useEffect(() => {
    if (targetEntryId) {
      setPendingEntryId(targetEntryId)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [])

  const scrollToEntry = useCallback((entryId) => {
    const entryRef = entryRefs.current[entryId]
    if (!entryRef || !scrollViewRef.current) {
      return false
    }

    const scrollViewNode = findNodeHandle(scrollViewRef.current)
    if (!scrollViewNode || !entryRef.measureLayout) {
      return false
    }

    entryRef.measureLayout(
      scrollViewNode,
      (x, y) => {
        scrollViewRef.current.scrollTo({ y: Math.max(y - 40, 0), animated: true })
        setHighlightedEntryId(entryId)
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current)
        }
        highlightTimeoutRef.current = setTimeout(() => setHighlightedEntryId(null), 4000)
      },
      () => {}
    )

    return true
  }, [])

  useEffect(() => {
    if (!pendingEntryId || !entries || entries.length === 0) {
      return
    }

    let attempts = 0
    const intervalId = setInterval(() => {
      const success = scrollToEntry(pendingEntryId)

      if (success || attempts >= 10) {
        setPendingEntryId(null)
        clearInterval(intervalId)
      }

      attempts += 1
    }, 300)

    return () => {
      clearInterval(intervalId)
    }
  }, [pendingEntryId, scrollToEntry, entries])

  const onRefresh = async () => {
    await getItemDetail('refresh')
  }

  const handleLike = async (entryId) => {
    try {
      const findEntry = (entries) => {
        for (const entry of entries) {
          if (entry.id === entryId) {
            return entry
          }
          if (entry.replies && entry.replies.length > 0) {
            const found = findEntry(entry.replies)
            if (found) return found
          }
        }
        return null
      }

      const currentEntry = entries && entries.length > 0 ? findEntry(entries) : null
      const currentLikeCount = Number(currentEntry?.likeCount) || 0
      const currentIsLiked = Boolean(currentEntry?.isLiked) || false

      // TODO: Backend'de bu endpoint oluşturulacak
      const endpoint = apiConstant.BaseUrl + `/api/discover/LikeEntry/${entryId}`
      const response = await PostAxios(endpoint, {})

      let isLiked = currentIsLiked
      let likeCount = currentLikeCount

      if (response && response.data) {
        let responseData = null
        
        if (response.data.data && response.data.data.data) {
          responseData = response.data.data.data
        } else if (response.data.data) {
          responseData = response.data.data
        } else {
          responseData = response.data
        }

        if (responseData) {
          if (responseData.isLiked !== undefined && responseData.isLiked !== null) {
            isLiked = Boolean(responseData.isLiked)
          }
          
          let newLikeCount = null
          if (responseData.likeCount !== undefined && responseData.likeCount !== null) {
            newLikeCount = responseData.likeCount
          } else if (responseData.entry && responseData.entry.likeCount !== undefined) {
            newLikeCount = responseData.entry.likeCount
          } else if (responseData.data && responseData.data.likeCount !== undefined) {
            newLikeCount = responseData.data.likeCount
          }

          if (newLikeCount !== null && newLikeCount !== undefined) {
            likeCount = typeof newLikeCount === 'string' 
              ? parseInt(newLikeCount, 10) 
              : Number(newLikeCount)
            
            if (isNaN(likeCount)) {
              likeCount = currentLikeCount
            }
          } else {
            likeCount = currentLikeCount
          }
        }
      }

      const updateEntry = (entries) => {
        return entries.map((entry) => {
          if (entry.id === entryId) {
            return {
              ...entry,
              isLiked: isLiked,
              likeCount: likeCount
            }
          }
          if (entry.replies && entry.replies.length > 0) {
            return {
              ...entry,
              replies: updateEntry(entry.replies)
            }
          }
          return entry
        })
      }

      if (entries && entries.length) {
        setEntries((prevEntries) => updateEntry(prevEntries))
      }
    } catch (error) {
      console.warn('[Like] Beğeni hatası:', error)
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Hata', error.response.data.message)
      }
    }
  }

  const handleReply = (entry) => {
    setReplyEntry(entry)
    setCreateEntryModalVisible(true)
  }

  const handleCreateEntry = () => {
    setReplyEntry(null)
    setCreateEntryModalVisible(true)
  }

  const handleCloseModal = () => {
    setCreateEntryModalVisible(false)
    setReplyEntry(null)
    setTimeout(() => {
      getItemDetail()
    }, 300)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
      return `${minutes} dakika önce`
    } else if (hours < 24) {
      return `${hours} saat önce`
    } else if (days < 7) {
      return `${days} gün önce`
    } else {
      return date.toLocaleDateString('tr-TR')
    }
  }

  const isCloseToBottom = (nativeEvent) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
    const paddingToBottom = 24
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
  }

  const loadMoreEntries = () => {
    if (loading || refreshing || entriesLoadingMore || !entriesHasMore) {
      return
    }

    fetchEntries(entriesPageNumber + 1, 'loadMore')
  }

  const renderEntry = (entry, isReply = false) => {
    const isHighlighted = highlightedEntryId === entry.id

    return (
      <View
        key={entry.id}
        ref={(node) => {
          if (node) {
            entryRefs.current[entry.id] = node
          } else {
            delete entryRefs.current[entry.id]
          }
        }}
        style={[
          {
            backgroundColor: isReply ? '#f8f9fa' : '#E0F2F1',
            marginLeft: isReply ? 25 : 0,
            marginBottom: 12,
            padding: 16,
            borderRadius: 12,
            borderLeftWidth: isReply ? 4 : 0,
            borderLeftColor: isReply ? '#4c669f' : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: isReply ? 0 : 2,
            borderColor: isReply ? '#e9ecef' : '#80CBC4'
          },
          isHighlighted && {
            borderColor: '#FFB74D',
            borderWidth: 3,
            shadowColor: '#FFB74D',
            backgroundColor: '#FFF8E1'
          }
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MaterialCommunityIcons name="account-circle" size={20} color="#4c669f" />
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginLeft: 5, color: '#333' }}>
              {entry.userName}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#999' }}>{formatDate(entry.createDate)}</Text>
        </View>

        <Text style={{ fontSize: 15, color: '#333', marginBottom: 10, lineHeight: 22, fontWeight: "bold" }}>
          {entry.content}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => handleLike(entry.id)}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}
            >
              <MaterialCommunityIcons
                name={entry.isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={entry.isLiked ? '#e91e63' : '#999'}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: entry.isLiked ? '#e91e63' : '#999',
                  marginLeft: 5
                }}
              >
                {entry.likeCount || 0}
              </Text>
            </TouchableOpacity>

            {!isReply && (
              <TouchableOpacity
                onPress={() => handleReply(entry)}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <MaterialCommunityIcons name="reply" size={20} color="#999" />
                <Text style={{ fontSize: 14, color: '#999', marginLeft: 5 }}>
                  {DeviceLanguage === 'ar' ? 'رد' : 'Cevapla'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {entry.replies && entry.replies.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {entry.replies.map((reply) => renderEntry(reply, true))}
          </View>
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <Background>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4c669f" />
        </View>
      </Background>
    )
  }

  if (!item) {
    return (
      <Background>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
            {DeviceLanguage === 'ar' ? 'المحتوى غير موجود' : 'İçerik bulunamadı'}
          </Text>
        </View>
      </Background>
    )
  }

  const currentPosition = playbackStatus?.positionMillis ? playbackStatus.positionMillis / 1000 : 0
  const duration = playbackStatus?.durationMillis ? playbackStatus.durationMillis / 1000 : 0

  return (
    <Background>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, width: '100%' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMoreEntries()
          }
        }}
        onMomentumScrollEnd={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMoreEntries()
          }
        }}
        onScrollEndDrag={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMoreEntries()
          }
        }}
        scrollEventThrottle={16}
      >
        {/* İçerik Kartı */}
        <View
          style={{
            backgroundColor: '#f1f3f5',
            margin: 15,
            marginBottom: 20,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#4c669f',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 5,
            borderWidth: 2,
            borderColor: '#4c669f'
          }}
        >
          {/* Resim */}
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${apiConstant.IMAGEBASEURL}/${item.imageUrl}` }}
              style={{
                width: '100%',
                height: 250,
                borderRadius: 12,
                marginBottom: 15,
                resizeMode: 'cover'
              }}
            />
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                backgroundColor: '#4c669f',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 10
              }}
            >
              <MaterialCommunityIcons name="newspaper" size={18} color="white" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#2c3e50',
                flex: 1
              }}
            >
              {item.title}
            </Text>
          </View>
          
          <Text
            style={{
              fontSize: 15,
              color: '#495057',
              marginBottom: 16,
              lineHeight: 24,
              backgroundColor: 'white',
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: '#4c669f',
            }}
          >
            {item.content}
          </Text>

          {/* MP3 Player */}
          {item.audioUrl && (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: '#e0e0e0'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <MaterialCommunityIcons name="music" size={24} color="#4c669f" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#333' }}>
                  Ses İçeriği
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={isPlaying ? pauseAudio : playAudio}
                  disabled={isLoadingAudio}
                  style={{
                    backgroundColor: '#4c669f',
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {isLoadingAudio ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <MaterialCommunityIcons
                      name={isPlaying ? 'pause' : 'play'}
                      size={28}
                      color="white"
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={stopAudio}
                  style={{
                    backgroundColor: '#999',
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 10
                  }}
                >
                  <MaterialCommunityIcons name="stop" size={20} color="white" />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={duration || 1}
                    value={currentPosition}
                    minimumTrackTintColor="#4c669f"
                    maximumTrackTintColor="#e0e0e0"
                    thumbTintColor="#4c669f"
                    onSlidingComplete={(value) => seekAudio(value)}
                    disabled={!sound || duration === 0}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      {formatTime(currentPosition)}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      {formatTime(duration)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 14,
              borderTopWidth: 2,
              borderTopColor: '#dee2e6'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#e7f3ff',
                borderRadius: 16,
                paddingHorizontal: 10,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <MaterialCommunityIcons name="heart" size={16} color="#4c669f" />
              <Text style={{ fontSize: 13, color: '#4c669f', marginLeft: 6, fontWeight: '600' }}>
                {item.likeCount || 0} Beğeni
              </Text>
            </View>
            
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f1f3f5',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12
              }}
            >
              <MaterialCommunityIcons name="clock-outline" size={14} color="#6c757d" />
              <Text style={{ fontSize: 12, color: '#6c757d', marginLeft: 5, fontWeight: '500' }}>
                {formatDate(item.createDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Yorumlar Bölümü */}
        <View style={{ paddingHorizontal: 15, paddingBottom: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
              paddingBottom: 10,
              borderBottomWidth: 2,
              borderBottomColor: '#4c669f'
            }}
          >
            <MaterialCommunityIcons name="message-reply-text" size={20} color="#4c669f" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginLeft: 8
              }}
            >
              {DeviceLanguage === 'ar' ? 'الردود' : 'Yorumlar'}
            </Text>
            {entryTotalCount > 0 && (
              <View
                style={{
                  backgroundColor: '#4c669f',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginLeft: 10
                }}
              >
                <Text style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>
                  {entryTotalCount}
                </Text>
              </View>
            )}
          </View>

          {entries && entries.length > 0 ? (
            entries.map((entry) => renderEntry(entry))
          ) : (
            <View
              style={{
                padding: 30,
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e9ecef',
                borderStyle: 'dashed'
              }}
            >
              <MaterialCommunityIcons name="message-outline" size={48} color="#adb5bd" />
              <Text style={{ fontSize: 16, color: '#6c757d', marginTop: 12, fontWeight: '500' }}>
                {DeviceLanguage === 'ar' ? 'لا توجد ردود' : 'Henüz yorum yok'}
              </Text>
              <Text style={{ fontSize: 14, color: '#adb5bd', marginTop: 6 }}>
                {DeviceLanguage === 'ar' ? 'كن أول من يرد' : 'İlk yorumu sen yap'}
              </Text>
            </View>
          )}
          {entriesLoadingMore && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#4c669f" />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Yeni Yorum Yaz Butonu */}
      <TouchableOpacity
        onPress={handleCreateEntry}
        style={{
          position: 'absolute',
          bottom: 60,
          right: 20,
          backgroundColor: '#4c669f',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5
        }}
      >
        <MaterialCommunityIcons name="pencil" size={28} color="white" />
      </TouchableOpacity>

      <AdmobViewBanner
        iosAdUnitId="ca-app-pub-8795169628743262/9326945854"
        androidAdUnitId="ca-app-pub-8795169628743262/4266190864"
        bannerSize="SMART_BANNER"
        style={{ alignItems: 'center', paddingVertical: 4 }}
      />

      {/* Yeni Yorum Oluşturma Modal */}
      <Modal
        visible={createEntryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <CreateEntry
          navigation={{
            ...props.navigation,
            goBack: handleCloseModal
          }}
          route={{
            params: {
              itemId: item?.id,
              parentEntryId: replyEntry?.id,
              parentEntryContent: replyEntry?.content
            }
          }}
        />
      </Modal>
    </Background>
  )
}

export default DiscoverDetail

