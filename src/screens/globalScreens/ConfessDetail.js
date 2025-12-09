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
  findNodeHandle
} from 'react-native'
import Background from '../../components/Background'
import apiConstant from '../../helpers/dataApi/apiConstant'
import { GetAxios, PostAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud'
import { LinearGradient } from 'expo-linear-gradient'
import { DeviceLanguage, LangApp } from '../../components/Language'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AdmobViewBanner from '../../components/ads/AdmobViewBanner'
import CreateEntry from './CreateEntry'

function ConfessDetail(props) {
  const { topicId, targetEntryId } = props.route.params || {}
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createEntryModalVisible, setCreateEntryModalVisible] = useState(false)
  const [replyEntry, setReplyEntry] = useState(null) // Cevaplanacak entry bilgisi
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

  useEffect(() => {
    getConfessDetail('initial')
  }, [topicId])

  const fetchEntries = async (page = 1, mode = 'initial') => {
    try {
      if (mode === 'loadMore') {
        setEntriesLoadingMore(true)
      }

      if (page === 1) {
        entryRefs.current = {}
      }

      const endpoint = apiConstant.BaseUrl + '/api/topic/GetEntries'
      const response = await PostAxiosAnonym(endpoint, {
        TopicId: topicId,
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

  const getConfessDetail = async (mode = 'initial') => {
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

      const endpoint = apiConstant.BaseUrl + `/api/topic/GetById/${topicId}`
      const response = await GetAxios(endpoint)

      if (response.data && response.data.data) {
        setTopic(response.data.data)
        setEntryTotalCount(response.data.data.entryCount || 0)
        await fetchEntries(1, 'initial')
      } else {
        setTopic(null)
        setEntryTotalCount(0)
        setEntries([])
      }
    } catch (error) {
      console.warn('Topic detay yüklenirken hata:', error)
      Alert.alert('Hata', 'Konu yüklenirken bir hata oluştu')
    } finally {
      if (mode === 'refresh') {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (targetEntryId) {
      setPendingEntryId(targetEntryId)
    }
  }, [targetEntryId])

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
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
    await getConfessDetail('refresh')
  }

  const handleLike = async (entryId) => {
    try {
      // Önce mevcut entry'yi bul
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

      console.log(`[Like] BEFORE - entryId=${entryId}, likeCount=${currentLikeCount}, isLiked=${currentIsLiked}`)

      const endpoint = apiConstant.BaseUrl + `/api/entry/Like/${entryId}`
      const response = await PostAxios(endpoint, {})

      console.log('[Like] RESPONSE:', JSON.stringify(response.data, null, 2))

      // Response yapısını kontrol et - farklı yapıları dene
      let isLiked = currentIsLiked
      let likeCount = currentLikeCount

      if (response && response.data) {
        // Tüm olası response yapılarını kontrol et
        let responseData = null
        
        // response.data.data.data yapısı
        if (response.data.data && response.data.data.data) {
          responseData = response.data.data.data
          console.log('[Like] Using response.data.data.data')
        }
        // response.data.data yapısı
        else if (response.data.data) {
          responseData = response.data.data
          console.log('[Like] Using response.data.data')
        }
        // response.data yapısı
        else {
          responseData = response.data
          console.log('[Like] Using response.data')
        }

        if (responseData) {
          console.log('[Like] ResponseData:', JSON.stringify(responseData, null, 2))
          
          // isLiked kontrolü
          if (responseData.isLiked !== undefined && responseData.isLiked !== null) {
            isLiked = Boolean(responseData.isLiked)
            console.log(`[Like] isLiked from response: ${isLiked}`)
          }
          
          // likeCount kontrolü - önce tüm olası yerleri kontrol et
          let newLikeCount = null
          
          // Önce responseData.likeCount'u kontrol et
          if (responseData.likeCount !== undefined && responseData.likeCount !== null) {
            newLikeCount = responseData.likeCount
          }
          // Belki responseData içinde entry objesi var
          else if (responseData.entry && responseData.entry.likeCount !== undefined) {
            newLikeCount = responseData.entry.likeCount
          }
          // Belki responseData içinde data objesi var
          else if (responseData.data && responseData.data.likeCount !== undefined) {
            newLikeCount = responseData.data.likeCount
          }

          if (newLikeCount !== null && newLikeCount !== undefined) {
            // String ise number'a çevir
            likeCount = typeof newLikeCount === 'string' 
              ? parseInt(newLikeCount, 10) 
              : Number(newLikeCount)
            
            // NaN kontrolü
            if (isNaN(likeCount)) {
              console.warn('[Like] likeCount is NaN, keeping current value')
              likeCount = currentLikeCount
            } else {
              console.log(`[Like] likeCount from response: ${likeCount} (was: ${currentLikeCount})`)
            }
          } else {
            console.warn('[Like] likeCount not found in response, keeping current value')
            likeCount = currentLikeCount
          }
        }
      }

      console.log(`[Like] AFTER - isLiked=${isLiked}, likeCount=${likeCount}`)

      // Entry'yi güncelle
      const updateEntry = (entries) => {
        return entries.map((entry) => {
          if (entry.id === entryId) {
            const updatedEntry = {
              ...entry,
              isLiked: isLiked,
              likeCount: likeCount
            }
            console.log(`[Like] UPDATING Entry ${entryId}:`, {
              oldLikeCount: entry.likeCount,
              newLikeCount: updatedEntry.likeCount,
              oldIsLiked: entry.isLiked,
              newIsLiked: updatedEntry.isLiked
            })
            return updatedEntry
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
        setEntries((prevEntries) => {
          const updatedEntries = updateEntry(prevEntries)
          console.log('[Like] Entries state updated')
          return updatedEntries
        })
      }
    } catch (error) {
      console.warn('[Like] Beğeni hatası:', error)
      console.warn('[Like] Error response:', error.response?.data)
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
    setReplyEntry(null) // Yeni entry, reply değil
    setCreateEntryModalVisible(true)
  }

  const handleCloseModal = () => {
    setCreateEntryModalVisible(false)
    setReplyEntry(null)
    // Modal kapandıktan sonra listeyi yenile
    setTimeout(() => {
      getConfessDetail()
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

        <Text style={{ fontSize: 15, color: '#333', marginBottom: 10, lineHeight: 22,fontWeight:"bold" }}>
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

        {/* Cevaplar */}
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

  if (!topic) {
    return (
      <Background>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
            {DeviceLanguage === 'ar' ? 'الموضوع غير موجود' : 'Konu bulunamadı'}
          </Text>
        </View>
      </Background>
    )
  }

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
        {/* Konu Başlığı - Modern Kart Tasarımı */}
        <View
          style={{
            backgroundColor: '#f1d7d7ff',
            margin: 15,
            marginBottom: 20,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#9f4c4cff',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 5,
            borderWidth: 2,
            borderColor: '#9f4c4cff'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                backgroundColor: '#9f4c4cff',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 10
              }}
            >
              <MaterialCommunityIcons name="forum" size={18} color="white" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#2c3e50',
                flex: 1
              }}
            >
              {topic.title}
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
              borderLeftColor: '#9f4c4cff',
              
            }}
          >
            {topic.description}
          </Text>

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
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  backgroundColor: '#e7f3ff',
                  borderRadius: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <MaterialCommunityIcons name="account-circle" size={16} color="#4c669f" />
                <Text style={{ fontSize: 13, color: '#4c669f', marginLeft: 6, fontWeight: '600' }}>
                  {topic.userName}
                </Text>
              </View>
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
                {formatDate(topic.createDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cevaplar Bölümü */}
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
                {DeviceLanguage === 'ar' ? 'لا توجد ردود' : 'Henüz yazı yok'}
              </Text>
              <Text style={{ fontSize: 14, color: '#adb5bd', marginTop: 6 }}>
                {DeviceLanguage === 'ar' ? 'كن أول من يرد' : 'İlk cevabı sen ver'}
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

      {/* Yeni Entry Yaz Butonu */}
      <TouchableOpacity
        onPress={handleCreateEntry}
        style={{
          position: 'absolute',
          bottom: 60,
          right: 20,
          backgroundColor: '#9f4c4cff',
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

      {/* Yeni Yazı Oluşturma Modal */}
      <Modal
        visible={createEntryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <CreateEntry
          IsConfess={true}
          navigation={{
            ...props.navigation,
            goBack: handleCloseModal
          }}
          route={{
            params: {
              topicId: topic?.id,
              parentEntryId: replyEntry?.id,
              parentEntryContent: replyEntry?.content
            }
          }}
        />
      </Modal>
    </Background>
  )
}

export default ConfessDetail

