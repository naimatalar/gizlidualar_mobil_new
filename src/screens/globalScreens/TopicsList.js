import React, { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, RefreshControl, ActivityIndicator, Modal } from 'react-native'
import Background from '../../components/Background'
import apiConstant from '../../helpers/dataApi/apiConstant'
import { GetAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud'
import { LinearGradient } from 'expo-linear-gradient'
import { DeviceLanguage, LangApp } from '../../components/Language'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AdmobViewBanner from '../../components/ads/AdmobViewBanner'
import CreateTopic from './CreateTopic'

function TopicsList(props) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [createTopicModalVisible, setCreateTopicModalVisible] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    getTopics()
  }, [])

  const getTopics = async (page = 1, mode = 'initial') => {
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

      const endpoint = apiConstant.BaseUrl + '/api/topic/GetAll'
      const response = await PostAxiosAnonym(endpoint, {
        PageNumber: page,
        PageSize: 10
      })

      if (response.data && response.data.data) {
        const newTopics = response.data.data.list || []

        setTopics((prevTopics) => (page === 1 ? newTopics : [...prevTopics, ...newTopics]))

        const totalCount = response.data.data.totalCount ?? response.data.data.count
        if (typeof totalCount === 'number') {
          setHasMore(page * 10 < totalCount)
        } else {
          setHasMore(newTopics.length === 10)
        }

        setPageNumber(page)
      }
    } catch (error) {
      console.warn('Topics yüklenirken hata:', error)
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
    getTopics(1, 'refresh')
  }

  const loadMore = () => {
    if (loading || refreshing || isLoadingMore || !hasMore) {
      return
    }

    getTopics(pageNumber + 1, 'loadMore')
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

  if (loading && topics.length === 0) {
    return (
      <Background>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4c669f" />
        </View>
      </Background>
    )
  }

  return (
    <Background>
      <LinearGradient
        start={{ x: 0.2, y: 0.3 }}
        style={{ padding: 7, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        colors={['#4c669f', 'transparent']}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>
          {DeviceLanguage === 'ar' ? 'المواضيع' : 'Konular'}
        </Text>
        <TouchableOpacity
          onPress={() => setCreateTopicModalVisible(true)}
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#4c669f" />
          <Text style={{ color: '#4c669f', fontWeight: 'bold', marginLeft: 5 }}>
            {DeviceLanguage === 'ar' ? 'جديد' : 'Yeni Konu Yaz'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
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
        {topics.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>
              {DeviceLanguage === 'ar' ? 'لا توجد مواضيع' : 'Henüz konu yok'}
            </Text>
          </View>
        ) : (
          topics.map((topic, index) => (
            <TouchableOpacity
              key={topic.id || index}
              onPress={() => props.navigation.navigate('TopicDetail', { topicId: topic.id })}
              style={{
                backgroundColor: 'white',
                margin: 10,
                padding: 15,
                borderRadius: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                {topic.title}
              </Text>
              <Text
                style={{ fontSize: 14, color: '#666', marginBottom: 10 }}
                numberOfLines={2}
              >
                {topic.description}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="account" size={16} color="#999" />
                  <Text style={{ fontSize: 12, color: '#999', marginLeft: 5 }}>
                    {topic.userName} 
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="message-text" size={16} color="#999" />
                  <Text style={{ fontSize: 12, color: '#999', marginLeft: 5 }}>
                    {topic.entryCount || 0}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#999' }}>
                  {formatDate(topic.createDate)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        {(isLoadingMore) && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#4c669f" />
          </View>
        )}
      </ScrollView>
      <AdmobViewBanner
        iosAdUnitId="ca-app-pub-8795169628743262/9326945854"
        androidAdUnitId="ca-app-pub-8795169628743262/4266190864"
        bannerSize="SMART_BANNER"
        style={{ alignItems: 'center', paddingVertical: 4 }}
      />

      {/* Yeni Konu Oluşturma Modal */}
      <Modal
        visible={createTopicModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateTopicModalVisible(false)}
      >
        <CreateTopic
          navigation={{
            ...props.navigation,
            goBack: () => {
              setCreateTopicModalVisible(false)
              // Modal kapandıktan sonra listeyi yenile
              setTimeout(() => {
                getTopics(1, 'refresh')
              }, 300)
            }
          }}
        />
      </Modal>
    </Background>
  )
}

export default TopicsList

