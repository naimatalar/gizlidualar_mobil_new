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

function CreateTopic(props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Uyarı', DeviceLanguage === 'ar' ? 'يرجى إدخال العنوان' : 'Lütfen başlık girin')
      return
    }

    if (!description.trim()) {
      Alert.alert('Uyarı', DeviceLanguage === 'ar' ? 'يرجى إدخال الوصف' : 'Lütfen açıklama girin')
      return
    }

    try {
      setLoading(true)
      const endpoint = apiConstant.BaseUrl + '/api/topic/Create'
      const response = await PostAxios(endpoint, {
        title: title.trim(),
        description: description.trim(),
        isConfess:props.IsConfess||false
      })

      console.log('CreateTopic Response:', JSON.stringify(response.data, null, 2))

      if (response.data) {
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
      
        if (responseData && responseData.data.id) {
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
      console.warn('Konu oluşturma hatası:', error)
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
        colors={props.IsConfess!=true&&['#4c669f', 'transparent']||['#9f4c4cff', 'transparent']}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ marginRight: 15 }}>
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
            {DeviceLanguage === 'ar' ? 'موضوع جديد' : props.IsConfess!=true&&'Yeni Konu'||"Yeni İtiraf"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, padding: 15 ,width: '100%'}}>
        <TextInput
          label={DeviceLanguage === 'ar' ? 'العنوان' : 'Başlık'}
          value={title}
          onChangeText={setTitle}
          placeholder={DeviceLanguage === 'ar' ? 'أدخل العنوان' : 'Konu başlığını girin'}
          maxLength={200}
        />

        <TextInput
        
          label={DeviceLanguage === 'ar' ? 'المحتوى' : 'İçerik'}
          value={description}
          onChangeText={setDescription}
          placeholder={DeviceLanguage === 'ar' ? 'أدخل المحتوى' : 'İçerik'}
          multiline
          
          
          style={{ 
         
            textAlignVertical: 'top',
            paddingTop: 15,
            paddingBottom: 15,
            
          }}
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
              {DeviceLanguage === 'ar' ? 'إلغاء' : 'Vazgeç'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: props.IsConfess!=true&&'#4c669f'||"#9f4c4cff",
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
                <MaterialCommunityIcons name="check" size={20} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  {DeviceLanguage === 'ar' ? 'إنشاء' : 'Oluştur'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Background>
  )
}

export default CreateTopic

