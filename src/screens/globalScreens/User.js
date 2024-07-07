import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
const User = (props) => {
    const [userData, setUSerData] = useState(props.UserData?.data || {})
    const [refresh, setRefresh] = useState(new Date())

    useEffect(() => {
        start()


    }, [props.UserData?.data])



    const start = async () => {
        var endpoint = await apiConstant.BaseUrl + `/api/usermanager/GetCurrentMobilUser`
        var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
       
        if (rps.data) {

            setUSerData(rps.data)
            if (!props.UserData?.data) {
                props.changeUser({ UserData: rps.data })

            }

        }
    }
    const deleteMe = async () => {
        Alert.prompt("Uyarı", "Anahtarlarınız dahil bütün bilgileriniz silinecek. Onaylıyor Musunuz", [{
            text: "Tamam",
            onPress: async () => {
            
                var endpoint = await apiConstant.BaseUrl + `/api/usermanager/harddeletecurrent`
                var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
                var sads = await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x });
                props.start()
            },
            style: "default"
        },
        {
            text: "Vazgeç",
            style: "cancel"

        }

        ], "default")


        // if (confirm("Anahtarlarınız dahil bütün bilgileriniz silinecek. Onaylıyor Musunus?")) {
        //     var endpoint = await apiConstant.BaseUrl + `/api/usermanager/harddeletecurrent`
        //     var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        //     var sads = await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x });
        //     props.start()
        // }


    }

    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: 1 }}>

                <LinearGradient start={{ x: 0.0, y: 1.0 }} style={{ padding: 7 }} colors={['#4c669f', 'transparent']} >
                    <Text style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>Bilgilerim</Text>
                </LinearGradient>

            </View>
            <View style={{ flex: 11 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15, flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 17 }}>E-mail: </Text>
                    <Text style={{ fontSize: 17 }}>{userData.email} </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 17 }}>Telefon: </Text>
                    <Text style={{ fontSize: 17 }}>{userData.phoneNumber} </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", flex: 1, marginTop: 10,height:50 }}>
                    <TouchableOpacity style={{ backgroundColor: "red", padding: 5 ,height:30}} onPress={() => deleteMe()}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>Hesabı Sil</Text>
                    </TouchableOpacity>
                </View>
                {/* <View style={{ marginTop: 20, borderColor: "orange", borderWidth: 1, borderStyle: "solid", width: "98%", alignSelf: "center", backgroundColor: "#FFF4EE" }}>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 20, color: "white", backgroundColor: "orange", padding: 5 }}>Anahtar Sayısı: {userData.coin} </Text>

                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15, marginBottom: 15 }}>
                        <Text style={{ fontWeight: "bold", color: "#4c669f", fontStyle: "italic" }}>Anahtarlar duaların kilidini açar</Text>

                    </View>
                </View> */}
                <View style={{ flexDirection: "row", justifyContent: "center", backgroundColor: "#4c669f", marginTop: 15, padding: 5 }}>

                    <Text style={{ fontSize: 20, color: "white", fontWeight: "bold" }}>Kilidini Kaldırdığınız Dualar</Text>

                </View>
 
                <LinearGradient style={{ marginTop: 0, flex: 12, }} start={{ x: 0.0, y: 0.0 }}
                    colors={['#4c669f', 'transparent']} >
                    <ScrollView style={{ flex: 1 }}>

                        {userData.dualarLaboteUsers?.map((item, key) => {

                            return <TouchableOpacity key={key} style={{
                                flexDirection: "row",
                                width: "97%",
                                height: 130,
                                alignItems: "center",
                                backgroundColor: "#EDE7F6",
                                borderWidth: 1,
                                borderColor: "#9C27B0",
                                borderStyle: "dashed",
                                paddingBottom: 10,
                                paddingTop: 10,
                                borderRadius: 10,
                                alignSelf: "center",
                                marginTop: 15
                            }} onPress={() => { props.navigation.navigate("Steps", { item }) }}>

                                <View style={{ flex: 3 }}>
                                    <Image style={{ resizeMode: "contain", width: "100%", height: "100%" }} source={{ uri: apiConstant.IMAGEBASEURL + "/" + item.imageUrl }}></Image>
                                </View>
                                <View style={{ flex: 6 }}>
                                    <View style={{ justifyContent: "center", flexDirection: "row" }}>
                                        <Text style={{ fontWeight: "bold", fontSize: 18, textAlign: "center" }}>{item.title}</Text>
                                    </View>
                                    <View><Text>{item.description}... <Text style={{ fontWeight: "bold", color: "#338199" }}>Devamı---{">"}</Text></Text></View>

                                </View>

                            </TouchableOpacity>
                        })}
                        {userData.dualarLaboteUsers?.length == 0 &&
                            <View style={{ justifyContent: "center",alignItems:"center", marginTop: 15, backgroundColor: "#fafafa69", paddingBottom: 15, paddingTop: 15 }}>
                                <Text style={{ marginTop:20,textAlign: "center", fontSize: 17, color: "red", fontWeight: "bold" }}>Henüz kilidini açtığınız bir dua bulunmuyor</Text>
                                <Image style={{width:160,height:160,resizeMode:"contain",marginTop:40}} source={require("../../assets/emptyIcon.png")}></Image>
                            </View>}
                    </ScrollView>

                </LinearGradient>
            </View>



        </View>
    );
}
const mapStateToProps = (state) => {
    return {
        UserData: state
    }
}
const mapDispatchToProps = (dispatch) => {
    console.log("dispatch")
    return {

        changeUser: (data) => dispatch({ type: "UserData", payload: data })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(User);

