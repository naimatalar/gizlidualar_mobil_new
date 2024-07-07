import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import Icon from 'react-native-vector-icons/FontAwesome';
function LessonDetail(props) {
    const [lessonDetail, setLessonDetail] = useState({})
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        start()

    }, [props.route.params])
    const start = async () => {
        setLoading(true)
        var endpoint = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetLessonDetailByLessonCode/" + props.route.params.dersCode
        var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        setLessonDetail(rps.data[0])
       
        // setTimeout(() => {
           
        // }, 400);
         setLoading(false)
    }
    if (loading) {
        return <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
            <Image source={require("../../assets/loading.gif")} style={{ width: 70, height: 70 }}></Image>
        </View>
    }
    return (
        <View style={{ flexDirection: "column", flex: 1 }}>
            <View style={{ alignItems: "center", paddingTop: 15, paddingBottom: 5, backgroundColor: "blue" }}>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: "white" }}>{lessonDetail.ders_Adi}</Text>
                <Text style={{ color: "white" }}>{lessonDetail.ders_Kodu}</Text>
            </View>
            <View style={{ height: 150, flexDirection: "row" }}>
                <View style={{ flex: 1, flexDirection: "column", padding: 25, alignItems: "center" }}>
                    <View style={{ alignItems: "center", flex: 1, justifyContent: "flex-start", paddingBottom: 40, paddingTop: 10 }} >
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ fontWeight: "bold", textAlign: "center", fontSize: 20 }}>Dersin Hocası</Text>
                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>{lessonDetail.akademisyen_Unvan}</Text>
                            <Text style={{ textAlign: "center" }}>{lessonDetail.akademisyen_Ad_Soyad}</Text>
                        </View>

                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: "column", padding: 25 }}>
                    <View>
                        <Image source={{ uri: lessonDetail.akademisyen_Foto }} style={{ resizeMode: "contain", width: "100%", height: "100%" }}></Image>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: "row", height: 30, alignItems: "center", marginTop: 20, marginBottom: 20 }}>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 25, paddingRight: 25, justifyContent: "center" }}>

                    <Text style={{ backgroundColor: "#38006b", padding: 10, paddingBottom: 25, color: "white", fontWeight: "bold" }}>{lessonDetail.donem_Ad} Dönemi</Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "#e0e0e0", height: 30, alignItems: "center", marginTop: 20 }}>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 25, paddingRight: 25, justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold" }}>Program Türü  </Text>
                    <Text>{lessonDetail.prog_Tip} </Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", height: 30, alignItems: "center" }}>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 25, paddingRight: 25, justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold" }}>Ders Tipi </Text>
                    <Text>{lessonDetail.ders_Tip} </Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "#e0e0e0", height: 30, alignItems: "center" }}>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 25, paddingRight: 25, justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold" }}>Ders Açma Nedeni </Text>
                    <Text>{lessonDetail.ders_Acma_Neden} </Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", height: 30, alignItems: "center" }}>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 25, paddingRight: 25, justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold" }}>Öğretim Şekli </Text>
                    <Text>{lessonDetail.ogretim_Sekli} </Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "#e0e0e0", height: 30, alignItems: "center" }}>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 25, paddingRight: 25, justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold" }}>Fakülte </Text>
                    <Text>{lessonDetail.fak_Ad} </Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", height: 30, alignItems: "center" }}>
                <View style={{ flex: 1, flexDirection: "row", paddingLeft: 25, paddingRight: 25, justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold" }}>Bölüm </Text>
                    <Text>{lessonDetail.bol_Ad} </Text>
                </View>
            </View>


            <View style={{ flexDirection: "row", height: 30, alignItems: "center", marginTop: 50 }}>
                <View style={{ flex: 1, flexDirection: "column", paddingLeft: 25, paddingRight: 25, alignItems: "center" }}>
                    <Text style={{ fontWeight: "bold" }}>AKTS </Text>
                    <Text>{lessonDetail.akts} </Text>
                </View>
                <View style={{ flex: 1, flexDirection: "column", paddingLeft: 25, paddingRight: 25, alignItems: "center" }}>
                    <Text style={{ fontWeight: "bold" }}>Kredi </Text>
                    <Text>{lessonDetail.kredi} </Text>
                </View>
            </View>

        </View>


    );
}

export default LessonDetail;