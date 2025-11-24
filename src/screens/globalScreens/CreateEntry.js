import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import Background from '../../components/Background'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'
import apiConstant from '../../helpers/dataApi/apiConstant'
import { PostAxios } from '../../helpers/dataApi/crud'
import { LinearGradient } from 'expo-linear-gradient'
import { DeviceLanguage, LangApp } from '../../components/Language'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

function CreateEntry(props) {
  const { topicId, parentEntryId, parentEntryContent } = props.route.params || {}
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!content.trim()) {
      Alert.alert('Uyarı', DeviceLanguage === 'ar' ? 'يرجى إدخال المحتوى' : 'Lütfen içerik girin')
      return
    }

    try {
      setLoading(true)
      const endpoint = apiConstant.BaseUrl + '/api/entry/Create'
      const response = await PostAxios(endpoint, {
        topicId: topicId,
        content: content.trim(),
        parentEntryId: parentEntryId || null
      })

      console.log('CreateEntry Response:', JSON.stringify(response.data, null, 2))

      if (response.data ) {
        const responseData = response.data
        
        // IsError kontrolü
        if (responseData.isError) {
          Alert.alert(
            DeviceLanguage === 'ar' ? 'خطأ' : 'Hata',
            responseData.message || (DeviceLanguage === 'ar' ? 'حدث خطأ' : 'Bir hata oluştu')
          )
          return
        }

        // Başarılı
        if (responseData.data && responseData.data.id) {
          props.navigation.goBack()
        } else {
          Alert.alert(
            DeviceLanguage === 'ar' ? 'تحذير' : 'Uyarı',
            DeviceLanguage === 'ar' ? 'الاستجابة غير صحيحة' : 'Geçersiz yanıt alındı'
          )
        }
      } else {
        Alert.alert(
          DeviceLanguage === 'ar' ? 'خطأ' : 'Hata',
          DeviceLanguage === 'ar' ? 'استجابة غير صحيحة من الخادم' : 'Sunucudan geçersiz yanıt'
        )
      }
    } catch (error) {
      console.warn('Entry oluşturma hatası:', error)
      let errorMessage = DeviceLanguage === 'ar' ? 'حدث خطأ' : 'Bir hata oluştu'
      
      if (error.response && error.response.data) {
        if (error.response.data.message === 'Topluluk kurallarına aykırı') {
          errorMessage = DeviceLanguage === 'ar' 
            ? 'ينتهك قواعد المجتمع' 
            : 'Topluluk kurallarına aykırı'
        } else {
          errorMessage = error.response.data.message || errorMessage
        }
      }
      
      Alert.alert(DeviceLanguage === 'ar' ? 'خطأ' : 'Hata', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Background>
      <LinearGradient
        start={{ x: 0.2, y: 0.3 }}
        style={{ padding: 15, width: '100%' }}
        colors={['#4c669f', 'transparent']}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ marginRight: 15 }}>
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
            {parentEntryId
              ? DeviceLanguage === 'ar'
                ? 'رد على'
                : 'Cevap Yaz'
              : DeviceLanguage === 'ar'
              ? 'كتابة جديدة'
              : 'Yeni Yazı'}
          </Text>
        </View>
      </LinearGradient>

      {parentEntryContent && (
        <View
          style={{
            backgroundColor: '#f5f5f5',
            padding: 15,
            margin: 15,
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#4c669f'
          }}
        >
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>
            {DeviceLanguage === 'ar' ? 'الرد على:' : 'Cevap veriliyor:'}
          </Text>
          <Text style={{ fontSize: 14, color: '#333', fontStyle: 'italic' }}>
            {parentEntryContent}
          </Text>
        </View>
      )}

      <ScrollView style={{ flex: 1, padding: 15 ,width: '100%'  }}>
        <TextInput
          label={DeviceLanguage === 'ar' ? 'المحتوى' : 'İçerik'}
          value={content}
          onChangeText={setContent}
          placeholder={
            DeviceLanguage === 'ar'
              ? 'أدخل محتوى الرد'
              : 'Yazınızı buraya girin'
          }
          multiline
          numberOfLines={10}
          style={{ height : 150, textAlignVertical: 'top' }}
        />

        <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: '#f5f5f5',
              paddingVertical: 15,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: '#ddd',
              opacity: loading ? 0.5 : 1,
              marginRight: 5
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#666" />
            <Text style={{ color: '#666', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
              {DeviceLanguage === 'ar' ? 'إلغاء' : 'İptal'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: '#4c669f',
              paddingVertical: 15,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              opacity: loading ? 0.5 : 1,
              marginLeft: 5
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={20} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  {parentEntryId
                    ? DeviceLanguage === 'ar' ? 'إرسال الرد' : 'Cevap Gönder'
                    : DeviceLanguage === 'ar' ? 'إرسال' : 'Gönder'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Background>
  )
}

export default CreateEntry

