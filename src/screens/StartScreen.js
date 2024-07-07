import React, { useEffect } from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import { GetAxios, GetAxiosAnonym } from '../helpers/dataApi/crud'
import apiConstant from '../helpers/dataApi/apiConstant'
import { Image } from 'react-native'
import Loading from '../components/Loading'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { connect } from 'react-redux'

 function StartScreen(props) {
  useEffect(() => {


    start()

  }, []) 
  const start = async () => {
    // await AsyncStorage.removeItem("hlcapptokengDua")
    var urls = await apiConstant.BaseUrl(); 
    var token = await GetAxios(urls.sso + "/api/Auth/GetToken").then(x => { return x }).catch(x => { return false })
   
    if (token?.status == 200) {
    await AsyncStorage.setItem("hlcapptokengDua", token.data.data)

      var userData = await GetAxios(urls.integration + "/api/student/getuserinfobytoken").then(x => { return x.data }).catch(x => { return x })
  
 
      props.changeUser({ UserData: userData.data })

      if (userData.data.adAttr.isStudent) {
        props.navigation.navigate('StudentHomeScreen')
      } else {
        if (userData.data.detail.data[0].istihdamTuru == "İDARİ") {
          props.navigation.navigate('PersonalHomeScreen')
        } else {
          props.navigation.navigate('AcademicHomeScreen')
  
        }
      }

    }else{
      props.navigation.navigate('LoginScreen')

    } 
  }
  return (  
    <Background>  
      <Logo />
      <Loading width={40}></Loading>
      {/* <Header>Login Template</Header>
      <Paragraph> 
        The easiest way to start with your amazing application.
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')} 
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button> */}
    </Background>
  )


}
const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}
const mapDispatchToProps = (dispatch) => {

  return {

    changeUser: (data) => dispatch({ type: "setUser", payload: data })
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);

