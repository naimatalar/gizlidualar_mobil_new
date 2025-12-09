import React, { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, RefreshControl, ActivityIndicator, Image } from 'react-native'
import Background from '../../components/Background'
import apiConstant from '../../helpers/dataApi/apiConstant'
import { GetAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud'
import { LinearGradient } from 'expo-linear-gradient'
import { DeviceLanguage, LangApp } from '../../components/Language'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AdmobViewBanner from '../../components/ads/AdmobViewBanner'

function DiscoverList(props) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    getItems()
  }, [])

  const getItems = async (page = 1, mode = 'initial') => {
    const isRefresh = mode === 'refresh'
    const isLoadMore = mode === 'loadMore'

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else if (isLoadMore) {
        setIsLoadingMore(true)
      } else {
        setLoading(true)
      }

      // TODO: Backend'de bu endpoint oluşturulacak
      const endpoint = apiConstant.BaseUrl + '/api/discover/GetAll'
      const response = await PostAxiosAnonym(endpoint, {
        PageNumber: page,
        PageSize: 10
      })

      if (response.data && response.data.data) {
        const newItems = response.data.data.list || []

        setItems((prevItems) => (page === 1 ? newItems : [...prevItems, ...newItems]))

        const totalCount = response.data.data.totalCount ?? response.data.data.count
        if (typeof totalCount === 'number') {
          setHasMore(page * 10 < totalCount)
        } else {
          setHasMore(newItems.length === 10)
        }

        setPageNumber(page)
      }
    } catch (error) {
      console.warn('Discover items yüklenirken hata:', error)
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else if (isLoadMore) {
        setIsLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }

  const onRefresh = () => {
    getItems(1, 'refresh')
  }

  const loadMore = () => {
    if (loading || refreshing || isLoadingMore || !hasMore) {
      return
    }

    getItems(pageNumber + 1, 'loadMore')
  }

  const isCloseToBottom = (nativeEvent) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
    const paddingToBottom = 24
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
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

  if (loading && items.length === 0) {
    return (
      <Background>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6B7A3D" />
        </View>
      </Background>
    )
  }

  return (
    <Background>
      <LinearGradient
        start={{ x: 0.2, y: 0.3 }}
        style={{ padding: 7, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        colors={['#6B7A3D', 'transparent']}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>
          {DeviceLanguage === 'ar' ? 'اكتشف' : 'Akış'}
        </Text>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1,width:"100%" }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMore()
          }
        }}
        onMomentumScrollEnd={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMore()
          }
        }}
        onScrollEndDrag={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMore()
          }
        }}
        scrollEventThrottle={16}
      >
        {items.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>
              {DeviceLanguage === 'ar' ? 'لا توجد عناصر' : 'Henüz içerik yok'}
            </Text>
          </View>
        ) : (
          items.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              onPress={() => props.navigation.navigate('DiscoverDetail', { itemId: item.id })}
              style={{
                backgroundColor: 'white',
                margin: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#8B9A46',
                shadowColor: '#5A6B2F',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
                overflow: 'hidden'
              }}
            >
              {/* Resim varsa göster */}
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${apiConstant.IMAGEBASEURL}/${item.imageUrl}` }}
                  style={{
                    width: '100%',
                    height: 200,
                    resizeMode: 'cover'
                  }}
                />
              )}

              <View style={{ padding: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#6B7A3D' }}>
                  {item.title}
                </Text>
                <Text
                  style={{ fontSize: 14, color: '#666', marginBottom: 10 }}
                  numberOfLines={3}
                >
                  {item.content}
                </Text>

                {/* MP3 varsa göster */}
                {item.audioUrl && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    <MaterialCommunityIcons name="music" size={20} color="#6B7A3D" />
                    <Text style={{ fontSize: 12, color: '#666', marginLeft: 8, flex: 1 }}>
                      Ses içeriği mevcut
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="heart" size={16} color="#999" />
                    <Text style={{ fontSize: 12, color: '#999', marginLeft: 5 }}>
                      {item.likeCount || 0}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="message-text" size={16} color="#999" />
                    <Text style={{ fontSize: 12, color: '#999', marginLeft: 5 }}>
                      {item.commentCount || 0}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#999' }}>
                    {formatDate(item.createDate)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        {(isLoadingMore) && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#6B7A3D" />
          </View>
        )}
      </ScrollView>
      <AdmobViewBanner
        iosAdUnitId="ca-app-pub-8795169628743262/9326945854"
        androidAdUnitId="ca-app-pub-8795169628743262/4266190864"
        bannerSize="SMART_BANNER"
        style={{ alignItems: 'center', paddingVertical: 4 }}
      />
    </Background>
  )
}

export default DiscoverList

