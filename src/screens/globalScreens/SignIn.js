import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxiosAnonym, PostAxiosAnonym } from '../../helpers/dataApi/crud';
import { Modal, Portal, Text as PapperText, Button as PapperButton, Provider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native'

import * as IntentLauncher from 'expo-intent-launcher'
import MaterialCommunityIcons
    from 'react-native-vector-icons/MaterialCommunityIcons';
import { LangApp } from '../../components/Language';
function SignIn(props) {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [tempCode, setTempCode] = useState('')
    const [inputCode, setInputCode] = useState()
    const [visible, setVisible] = React.useState(false);
    const [isLogin, setIsLogin] = React.useState(false);
    const [createUser, setCreateUser] = React.useState({ email: "", phoneNumber, password: "", password2: "" });
    const [existUser, setExistUSer] = React.useState(false);
    const [accessGranted, setAccessGranted] = React.useState(false);
    const [password, setPassword] = React.useState();

    const [telTry, setTelTry] = React.useState(0);


    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);


    // const pkg = Constants.expoConfig.releaseChannel
    //     ? Constants.expoConfig.android.package
    //     : 'host.exp.exponent'

    // const openAppSettings = () => {
    //     if (Platform.OS === 'ios') {
    //         Linking.openURL('app-settings:')
    //     } else {
    //         IntentLauncher.startActivityAsync(
    //             IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
    //             { data: 'package:' + "com.gizldualarapplication.gizlidualar" },
    //         )
    //     }

    // }

    useEffect(() => {

        // accesContact()
    }, []);



    const authCode = async () => {

        var endpoint = await apiConstant.BaseUrl + `/api/Auth/GetPhoneCode/${phoneNumber}`
        var rps = await GetAxiosAnonym(endpoint).then(x => { return x.data }).catch(x => { return x });
        setTempCode(rps.data)
        if (!rps.isError) {
            // showModal() //düzeltilecek
            getToken(createUser.password, createUser.phoneNumber)
        }else{
            Alert.alert("Hata","Eksik Yada Hatalı Bilgi Girişi")
        }
    }
    const getToken = async (pass, nm) => {

        let tm;
        let num;
        if (pass) {
            tm = pass
        } else {
            tm = password
        }
        if (nm) {
            num = nm
        } else {
            num = phoneNumber
        }


        var endpoint = await apiConstant.BaseUrl + `/api/Auth/Login`
        var rps = await PostAxiosAnonym(endpoint, { phoneNumber: num, password: tm }).then(x => { return x.data }).catch(x => { return x });

        if (rps.data?.error == false) {

            setVisible(false)
            props.start()

            await AsyncStorage.setItem("hlcapptokengDua", rps.data.token)


        } else {
            Alert.alert("Hata", "Giriş bilgileri hatalı.")
        }

    }
    const createUserForm = async () => {

        // if (telTry == 0) {
            
        //     setCreateUser((d) => { return { ...d, phoneNumber: "" } })
        //     setTelTry(1)
        //     return false
        // }

        var endpoint = await apiConstant.BaseUrl + `/api/Auth/SignUp`
        var rps = await PostAxiosAnonym(endpoint, createUser).then(x => { return x.data }).catch(x => { return x });

        if (rps.isError == false) {
            // setVisible(true) Düzeltilecek
            setTempCode(rps.data.gecici)
            // getToken(createUser.password,createUser.phoneNumber)
            Alert.alert("Başarılı", "Kayıt başarılı giriş yapabilirsiniz.")
            setIsLogin(true)

        } else {
            setExistUSer(true)
        }
    }
    const validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };
    return (

        <View style={{ flex: 1 }}>

            <View style={{
                marginBottom: 20, marginTop: 30, flexDirection: "row", justifyContent: "space-around", width: "70%", alignSelf: "center",
                borderBottomWidth: 3,
                borderBottomColor: "green",
                borderBottomStyle: "dashed",
                paddingBottom: 10

            }}>
                <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => setIsLogin(false)} style={{ alignItems: "center", paddingTop: 10 }}>
                    <Text style={!isLogin && { color: 'green', fontWeight: 'bold', textDecorationLine: "underline" } || { fontWeight: 'bold' }}>{LangApp("kayitOl")}</Text>
                    {!isLogin && <MaterialCommunityIcons
                        name={"arrow-up"}
                        size={17}
                        color={"green"}
                    />}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(true)} style={{ alignItems: "center", paddingTop: 10 }}>
                    <Text style={isLogin && { color: 'green', fontWeight: 'bold', textDecorationLine: "underline" } || { fontWeight: 'bold' }}>{LangApp("girisYap")}</Text>
                    {isLogin && <MaterialCommunityIcons
                        name={"arrow-up"}
                        size={17}
                        color={"green"}
                    />}
                </TouchableOpacity>
            </View>

            {isLogin && <View style={{
                flex: 2, marginTop: 20,
            }}>
                <View style={{ justifyContent: "center", flexDirection: "row", marginBottom: 20 }}>

                    <Text style={{ textAlign: "center", fontWeight: "bold" }}>{LangApp("girisIcınTel")}</Text>
                </View>
                <View style={{ flexDirection: "column", width: "70%", alignSelf: "center" }}>
                <View style={{backgroundColor:"#AD1457",padding:10,borderRadius:10,marginBottom:5}}>
                <Text style={{color:"white",marginBottom:3,fontWeight:"bold",margin:5}}>{LangApp("telGerekli")}</Text>
                    <FloatingLabelInput
                        label="Kullanıcı Adı"
                        keyboardType='default'
                        hintTextColor={'#aaa'}
                        value={phoneNumber}
                        onChangeText={(val) => { ; setPhoneNumber(val) }}
                        containerStyles={{
                            borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: '#fff',
                            borderColor: 'blue',
                            borderRadius: 8,
                            height: 50,
                            marginTop: 10
                        }}
                        inputStyles={{
                            color: 'blue',
                            paddingHorizontal: 10,
                        }}
                    />
                    </View>

                    <FloatingLabelInput
                        label={LangApp("sifre")}
                        keyboardType="text"
                        hintTextColor={'#aaa'}

                        value={password}
                        onChangeText={(val) => { setPassword(val); }}
                        isPassword={true}
                        showPasswordContainerStyles={{ backgroundColor: "#388E3C", borderRadius: 5 }}
                        containerStyles={{
                            borderWidth: 2,
                            paddingHorizontal: 10,
                            backgroundColor: '#fff',
                            borderColor: 'blue',
                            borderRadius: 8,
                            height: 50,
                            marginTop: 10

                        }}
                        inputStyles={{
                            color: 'blue',
                            paddingHorizontal: 10,
                        }}
                    />

                </View>
                <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => { authCode() }} style={{
                    borderWidth: 1, borderColor: "#fe7013", borderStyle: "solid", width: "70%", height: 50,
                    alignItems: "center",
                    flexDirection: "row", justifyContent: "center", alignSelf: "center", marginTop: 50, padding: 10,
                    borderRadius: 5
                }}>
                    <Text style={{ color: "#fe7013", fontWeight: "bold" }}>{LangApp("devamEt")}</Text>
                </TouchableOpacity>
                {/* {accessGranted&&  <View style={{ marginTop: 50 }}>
                    <Text style={{ color: "red", fontWeight: "bold", fontSize: 16, textAlign: "center" }}>Doğrulama İçin Bilgilere Erişme İzni Vermelisin</Text>

                    <TouchableOpacity onPress={() => { accesContact() }} style={{
                        borderWidth: 1, borderColor: "red", borderStyle: "solid", width: "70%", height: 50,
                        alignItems: "center",
                        flexDirection: "row", justifyContent: "center", alignSelf: "center", marginTop: 10, padding: 10,
                        borderRadius: 5
                    }}>
                        <Text style={{ color: "red", fontWeight: "bold", fontSize: 20 }}>İzin Ver</Text>

                    </TouchableOpacity>

                </View>} */}


            </View>}
            {
                !isLogin && <View style={{ flex: 2, marginTop: 10, }}>
                    <View style={{ justifyContent: "center", flexDirection: "row", marginBottom: 10 }}>

                        <Text style={{ textAlign: "center", fontWeight: "bold" }}>{LangApp("kayitFormu")}</Text>
                    </View>
                    <View style={{ flexDirection: "column", width: "70%", alignSelf: "center" }}>


                        <FloatingLabelInput
                            label={LangApp("email")}
                            keyboardType='text'
                            hintTextColor={'#aaa'}
                            value={createUser.email}
                            onChangeText={(val) => { setCreateUser((d) => { return { ...d, email: val } }) }}
                            containerStyles={{
                                borderWidth: 2,
                                paddingHorizontal: 10,
                                backgroundColor: '#fff',
                                borderColor: 'blue',
                                borderRadius: 8,
                                height: 50,
                                marginBottom: 10
                            }}
                            inputStyles={{
                                color: 'blue',
                                paddingHorizontal: 10,

                            }}
                        />
                        <View style={{backgroundColor:"#AD1457",padding:5,borderRadius:10,marginBottom:10}}>
                         <Text style={{color:"white",marginBottom:3,fontWeight:"bold",margin:5}}>{LangApp("telGerekli")}</Text>
                        <FloatingLabelInput
                            label="Kullanıcı Adı"
                            keyboardType='default'
                            hintTextColor={'#aaa'}
                            value={createUser.phoneNumber}
                            onChangeText={(val) => { setCreateUser((d) => { return { ...d, phoneNumber: val } }); setPhoneNumber(val) }}
                            containerStyles={{
                                borderWidth: 2,
                                paddingHorizontal: 10,
                                backgroundColor: '#fff',
                                borderColor: 'blue',
                                borderRadius: 8,
                                height: 50,
                                marginBottom: 10,
                                

                            }}
                            inputStyles={{
                                color: 'blue',
                                paddingHorizontal: 10,
                              
                            }}
                        />
                      </View>
                        <FloatingLabelInput
                            label={LangApp("sifre")}
                            keyboardType="text"
                            hintTextColor={'#aaa'}

                            value={createUser.password}
                            onChangeText={(val) => { setCreateUser((d) => { return { ...d, password: val } }); }}
                            isPassword={true}
                            showPasswordContainerStyles={{ backgroundColor: "#388E3C", borderRadius: 5 }}
                            containerStyles={{
                                borderWidth: 2,
                                paddingHorizontal: 10,
                                backgroundColor: '#fff',
                                borderColor: 'blue',
                                borderRadius: 8,
                                height: 50,
                                marginBottom: 10

                            }}
                            inputStyles={{
                                color: 'blue',
                                paddingHorizontal: 10,
                            }}
                        />
                        <FloatingLabelInput
                            label={LangApp("sifreTekrari")}

                            hintTextColor={'#aaa'}

                            value={createUser.password2}
                            onChangeText={(val) => { setCreateUser((d) => { return { ...d, password2: val } }); }}
                            isPassword={true}
                            showPasswordContainerStyles={{ backgroundColor: "#388E3C", borderRadius: 5 }}
                            containerStyles={{
                                borderWidth: 2,
                                paddingHorizontal: 10,
                                backgroundColor: '#fff',
                                borderColor: 'blue',
                                borderRadius: 8,
                                height: 50,
                                marginBottom: 10

                            }}
                            inputStyles={{
                                color: 'blue',
                                paddingHorizontal: 10,
                            }}
                        />
                    </View>
                    <View>
                        {existUser && <Text style={{ textAlign: "center", marginTop: 10, color: "red", fontWeight: "bold" }}>{LangApp("mevcutKullanici")}</Text>}
                    </View>
                    <TouchableOpacity
 delayLongPress={()=>{return true}  }  
                        onPress={() => {
                            console.log(validateEmail(createUser.email))
                            if (validateEmail(createUser.email) == false) {
                                Alert.alert(LangApp("hata"), LangApp("emailHatali"))
                                return false
                            }
                            if (createUser.password != createUser.password2) {
                                Alert.alert(LangApp("hata"), LangApp("sifreEslesmedi"))
                                return false
                            }

                            if (!createUser.email) {
                                Alert.alert(LangApp("eksikBilgi"), LangApp ("emailBos"))
                                return false
                            }
                            if (!createUser.phoneNumber) {
                                Alert.alert(LangApp("eksikBilgi"), LangApp ("telefonBos"))
                                return false
                            }


                            createUserForm()
                        }} style={{
                            borderWidth: 1, borderColor: "#fe7013", borderStyle: "solid", width: "70%", height: 50,
                            alignItems: "center",
                            flexDirection: "row", justifyContent: "center", alignSelf: "center", marginTop: 20, padding: 10,
                            borderRadius: 5
                        }}>
                        <Text style={{ color: "#fe7013", fontWeight: "bold" }}>{LangApp("devamEt")}</Text>
                    </TouchableOpacity>
                    {/* {accessGranted&& <View style={{ marginTop: 50 }}>
                        <Text style={{ color: "red", fontWeight: "bold", fontSize: 16, textAlign: "center" }}>Doğrulama İçin Bilgilere Erişme İzni Vermelisin</Text>

                        <TouchableOpacity onPress={() => { accesContact() }} style={{
                            borderWidth: 1, borderColor: "red", borderStyle: "solid", width: "70%", height: 50,
                            alignItems: "center",
                            flexDirection: "row", justifyContent: "center", alignSelf: "center", marginTop: 10, padding: 10,
                            borderRadius: 5
                        }}>
                            <Text style={{ color: "red", fontWeight: "bold", fontSize: 20 }}>İzin Ver</Text>

                        </TouchableOpacity>

                    </View>} */}

                </View>
            }
            <Provider>
                <Portal>
                    <Modal visible={visible} contentContainerStyle={{ backgroundColor: 'white', padding: 20 }}>
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontWeight: "bold", fontSize: 12, color: "red" }}>Sms Gönderilen Numara {phoneNumber} </Text>
                            <Text style={{ color: "red", fontSize: 12, marginTop: 10 }}>Hatalı ise değiştirmek için <Text onPress={() => { hideModal() }} style={{ fontSize: 12, fontWeight: "bold", color: "blue" }}>Buraya Dokunun</Text> </Text>

                        </View>
                        <PapperText style={{ fontWeight: "bold", alignSelf: "center", marginBottom: 15, marginTop: 30 }}>Lütfen SMS Doğrulama Kodunu Giriniz.</PapperText>
                        <View style={{ width: 150, alignSelf: "center" }}>


                            <FloatingLabelInput
                                label="Kodu Giriniz"
                                keyboardType='numeric'
                                hintTextColor={'#aaa'}
                                maskType='phone'
                                value={inputCode}

                                mask="9999"

                                sty
                                onChangeText={(val) => { setInputCode(val) }}
                                containerStyles={{
                                    borderWidth: 2,
                                    paddingHorizontal: 10,
                                    backgroundColor: '#fff',
                                    borderColor: 'blue',
                                    borderRadius: 8,
                                    height: 60,

                                }}
                                inputStyles={{
                                    color: 'blue',
                                    paddingHorizontal: 10,
                                    fontSize: 20
                                }}
                            />
                        </View>
                        <Text>{tempCode}</Text>
                        <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => { getToken() }} style={{
                            borderWidth: 1, borderColor: "#fe7013", borderStyle: "solid", width: "100%",
                            flexDirection: "row", justifyContent: "center", alignSelf: "center", marginTop: 10, padding: 10,
                            borderRadius: 5, marginBottom: 30
                        }}>
                            <Text style={{ color: "#fe7013", fontWeight: "bold" }}>Gönder</Text>
                        </TouchableOpacity>

                    </Modal>
                </Portal>

            </Provider>
        </View>

    );
}

export default SignIn;