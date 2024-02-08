import React, { useEffect, useState } from 'react'
import { TouchableOpacity, StyleSheet, View, Image, Text } from 'react-native'

import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import LangApp from '../components/Language'
import { GetAxios, PostAxios, PostAxiosAnonym } from '../helpers/dataApi/crud'
import apiConstant from "../helpers/dataApi/apiConstant";
import AsyncStorage from '@react-native-async-storage/async-storage'

import AcademicHomeScreen from './Academic/AcadmicHomeScreen'
import PersonalNav from './Personal/PersonalNav'
import StudentNav from './Student/StudentNav'
import { Dialog } from "react-native-paper";
import * as Contacts from 'expo-contacts';

function LoginScreen() {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState()
  const [alertDialog, setAlertDialog] = useState(false)
  const [alertText, setAlertText] = useState("")







  const onLoginPressed = async () => {
    setIsLoading(true)
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      setIsLoading(false)
      return
    }


    var login = await PostAxiosAnonym((await apiConstant.BaseUrl()).sso + "/api/ldap/login", {
      email: email.value,
      password: password.value,
      appCode: "101"
    }).then(x => { return x.data }).catch(x => { return x });

    if (login.isError == true) {
      alert(login?.message)
      setIsLoading(false)
    }

    if (login.data?.token) {

      var dd = await AsyncStorage.setItem("hlcapptokengDua", login.data.token)
      var sasa = (await apiConstant.BaseUrl()).integration + "/api/token/GetTokenUserData"
      var rps = await GetAxios(sasa).then(x => { return x.data }).catch(x => { return x });

      setUserData(rps.data)

      setIsLoading(false)
      // props.changeUser({ UserData: userData.data })

      if (rps.data?.userType == "İDARİ") {
        setAlertDialog(true);
        setAlertText("İdari personel mobil uygulamamız yakında hizmete sunulacaktır.")
      }
      if (rps.data?.userType == "AKADEMİK") {
        setAlertDialog(true);
        setAlertText("Akademik personel mobil uygulamamız yakında hizmete sunulacaktır.")
      }


    }

  }

  // if (userData?.userType == "İDARİ") {
  //   return (
  //     <PersonalNav></PersonalNav>
  //   )
  // } 
  // else if (userData?.userType == "AKADEMİK") {
  //   return (

  //     <AcademicHomeScreen></AcademicHomeScreen>
  //   )
  // } else 
  if (userData?.userType == "STUDENT") {
    return (
      <StudentNav initialData={userData}></StudentNav>
    )
  }
  else {
    return (

      <Background>



        {/* <BackButton goBack={props.navigation.goBack} /> */}
        <Logo />
        <Header>HalicApp Login</Header>
        <View style={{ padding: 20, maxWidth: 340, flexDirection: "row" }}>

          <View style={{ flex: 1 }}>


            <TextInput
              label={LangApp("Email")}
              returnKeyType="next"
              value={email.value}
              onChangeText={(text) => setEmail({ value: text, error: '' })}
              error={!!email.error}
              errorText={email.error}
              autoCapitalize="none"
              autoCompleteType="email"
              textContentType="emailAddress"
              keyboardType="email-address"
            />
            <TextInput
              label={LangApp("Password")}
              returnKeyType="done"
              value={password.value}
              onChangeText={(text) => setPassword({ value: text, error: '' })}
              error={!!password.error}
              errorText={password.error}
              secureTextEntry
            />
            {/* <View style={styles.forgotPassword}>
              <TouchableOpacity
                onPress={() => props.navigation.navigate('ResetPasswordScreen')}
              >
                <Text style={styles.forgot}>Forgot your password?</Text>
              </TouchableOpacity>
            </View> */}
            <Button isLoading={isLoading} mode="contained" onPress={() => onLoginPressed()} >
              {isLoading &&
                <Image source={require("../assets/loading.gif")} style={{ width: 25, height: 22, resizeMode: "contain", flex: 1, marginRight: 10 }}></Image>

              }
              <Text style={{ flex: 1, color: "white", textTransform: "capitalize", fontWeight: "bold", fontSize: 20 }}>{LangApp("Login")}</Text>
            </Button>
            {/* <View style={styles.row}>
              <Text>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => props.navigation.replace('RegisterScreen')}>
                <Text style={styles.link}>Sign up</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
        <Dialog visible={alertDialog} onDismiss={() => setAlertDialog(false)} >
            <Dialog.Content>
              <View>
                <Text>{alertText}</Text>

                <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 30, paddingBottom: 20 }}>
                  <TouchableOpacity onPress={() => setAlertDialog(false)} style={{ backgroundColor: "green", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Tamam</Text></TouchableOpacity>
                  {/* <TouchableOpacity onPress={() => setPasswordDialog(false)} style={{ backgroundColor: "red", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Vazgeç</Text></TouchableOpacity> */}

                </View>
              </View>

            </Dialog.Content>
          </Dialog>
      </Background>
    )
  }


}

export default LoginScreen;

// const styles = StyleSheet.create({
//   forgotPassword: {
//     width: '100%',
//     alignItems: 'flex-end',
//     marginBottom: 24,
//   },
//   row: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   forgot: {
//     fontSize: 13,
//     color: theme.colors.secondary,
//   },
//   link: {
//     fontWeight: 'bold',
//     color: theme.colors.primary,
//   },
// })
