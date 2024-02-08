import React, { useEffect, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux';
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

    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: 1 }}>

                <LinearGradient start={{ x: 0.0, y: 1.0 }} style={{ padding: 7 }} colors={['#4c669f', 'transparent']} >
                    <Text style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>Profil Bilgilerim</Text>
                </LinearGradient>

            </View>
            <View style={{ flex: 11 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15, flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 17 }}>Kullanıcı Adı: </Text>
                    <Text style={{ fontSize: 17 }}>{userData.firstName} </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 17 }}>Telefon: </Text>
                    <Text style={{ fontSize: 17 }}>{userData.phoneNumber} </Text>
                </View> 
                <View style={{ marginTop: 20, borderColor: "orange", borderWidth: 1, borderStyle: "solid", width: "98%", alignSelf: "center", backgroundColor: "#FFF4EE" }}>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 20, color: "white", backgroundColor: "orange", padding: 5 }}>Anahtar Sayısı: {userData.coin} </Text>

                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 3, marginBottom: 15 }}>
                        <Text style={{ fontWeight: "bold", color: "orange" }}>Anahtarlar duaların kilidini açar</Text>

                    </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15, marginBottom: 10 }}>

                    <Text style={{ fontSize: 20, color: "#4c669f", fontWeight: "bold" }}>Kilidini Kaldırdığınız Dualar</Text>

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
                            <View style={{justifyContent:"center",marginTop:15,backgroundColor:"#fafafa69",paddingBottom:15,paddingTop:15}}>
                                <Text style={{textAlign:"center",fontSize:17,color:"#E65100"}}>Henüz kilidini açtığınız bir dua bulunmuyor</Text>
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

