import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { View } from 'react-native';
import { connect } from 'react-redux';
import Background from '../../components/Background';

import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceLanguage, LangApp } from '../../components/Language';
function Home(props) {

  const [cateory, setCategory] = useState()

  useEffect(() => { getCategory() }, [])

  const getCategory = async () => {

    // var dd = await AsyncStorage.removeItem("hlcapptokengDua")

    var endpoint = await apiConstant.BaseUrl + "/api/categoriAdmin/GetAllMbl/"
    var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
    setCategory(<View></View>)
    setCategory(rps.data.map((item, key) => {
      return <TouchableOpacity
        onPress={() => { props.navigation.navigate("CategoryDetail", { item }) }}
        style={{ flexDirection: "row", backgroundColor: "grey", marginBottom: 20, justifyContent: "center", padding: 7, }}
        key={key} >

        <Image style={{
          resizeMode: "cover", width: "100%", height: 170, borderRadius: 5,
          borderWidth: 1,
          borderColor: "white",

        }} source={{ uri: apiConstant.IMAGEBASEURL + "/" + item.imageUrl }}></Image>
        <View style={{ position: "absolute", top: 40, left: 20 }}>
      
           {DeviceLanguage == "ar" &&
            <Text style={{ fontWeight: "bold", fontSize: 35 }}>{item.nameArabic}</Text>||
            <Text style={{ fontWeight: "bold", fontSize: 35 }}>{item.name}</Text>
          }
          

         
        </View>
        <View style={{ position: "absolute", right: 10, bottom: 11, width: "90%", backgroundColor: "white", padding: 10, borderRadius: 10 }}>
     
          {DeviceLanguage == "ar" &&
          <Text style={{ fontSize: 15, color: "#347fde", borderRadius: 5 }}>{item.descriptionArabic}</Text>||
          <Text style={{ fontSize: 15, color: "#347fde", borderRadius: 5 }}>{item.description}</Text>
        }

        </View>

      </TouchableOpacity>
    }))
  }
  return (
    <Background>
      {/* <Logo /> */}
      {/* <View><Text style={{fontWeight:"bold",fontSize:15}}>Dua Kategorileri</Text></View> */}

      <LinearGradient start={{ x: 0.2, y: .3 }} style={{ padding: 7, width: "100%" }} colors={['#4c669f', 'transparent']} >
        <Text style={{ fontWeight: "bold", fontSize: 22, color: "white" }}>{LangApp( "duacat")}</Text>
      </LinearGradient>
      <View style={{ width: "100%", backgroundColor: "orange", padding: 5 }}>
        <Text style={{ fontSize: 12, color: "black", fontWeight: "bold" }}>{LangApp( "duaih")}</Text>

      </View>
      <ScrollView style={{ width: "100%", flexDirection: "column" }}>
        {cateory}
      </ScrollView>

    </Background>

  );
}
const mapStateToProps = (state) => {
  return {
    UserData: state
  }
}
const mapDispatchToProps = (dispatch) => {

  return {

    changeUser: (data) => dispatch({ type: "UserData", payload: data })
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Home);

