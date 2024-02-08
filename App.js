import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiConstant from './src/helpers/dataApi/apiConstant'

import { GetAxios } from './src/helpers/dataApi/crud'
import Index from './src/screens'
import { Dimensions, View } from 'react-native'
import Loading from './src/components/Loading'
// "expo-dev-client": "^2.4.11",

//  LogBox.ignoreAllLogs()
export default function App() {
  const [isLogin, setIsLogin] = useState(null);
  const [data, setData] = useState();
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    try {
      start()

    } catch (error) {
      throw error
    }


  }, [])


  const start = async () => {
    setRefresh(true)
    //  var sads=await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x }); //////Silinecek

    var tkn = await AsyncStorage.getItem("hlcapptokengDua").then(x => { return x })

    setTimeout(() => {
      setRefresh(false)

    }, 1000);





  }
 
  if (refresh == true) {
    return <View style={{ flexDirection: "row", flex:1,justifyContent: "center", alignItems: "center"}}>
    <Loading width={80}></Loading>
  </View>
  } else {

    return <Index startBase={start}></Index>
  }





}
