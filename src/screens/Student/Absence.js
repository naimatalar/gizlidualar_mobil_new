import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';

function Absence(props) {

    const [dates, setDates] = useState(props.route.params.detail)
    const [lesson, setLesson] = useState(props.route.params.lesson)
    const [lessonDetail, setLessonDetail] = useState({})
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        start()

        
    }, [props.route.params.lesson])

    const start = async () => {
        setLoading(true)

        var endpoint = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetLessonDetailByLessonCode/" + lesson.ders_Kod
        var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        setLessonDetail(rps.data[0])
      
        setLoading(false)
    }
    if (loading) {
        return <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
            <Image source={require("../../assets/loading.gif")} style={{ width: 70, height: 70 }}></Image>
        </View>
    }
    return (
        <View>
            <View style={{ backgroundColor: "blue", justifyContent: "center", alignItems: "center", paddingBottom: 15, paddingTop: 10 }}>
                <Text style={{ fontSize: 17, fontWeight: "bold", color: "white" }}>{lesson.ders_Adi}</Text>
                <Text style={{ color: "white" }}>({lesson.ders_Kod})</Text>

            </View>
            <View style={{ justifyContent: "center", alignItems: "center", paddingBottom: 10, paddingTop: 15 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "red" }}>Girilmeyen Ders Oturum Detayı</Text>
               

            </View>

            <ScrollView style={{ flexDirection: "column", paddingLeft: 10, paddingRight: 10 }}>
                <View style={{ flexDirection: "row" }}>


                    <View style={{ flex: 1 }}>

                        <View style={{ alignItems: "center", backgroundColor: "#e1f5fe", borderColor:"#82b3c9",borderWidth:1, borderRadius: 10, marginTop: 18, paddingBottom: 10, paddingTop: 10 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 17 }}>
                                Öğrenim Şekli
                            </Text>
                            <Text style={{ fontSize: 16, marginTop: 2 }}>
                                {lessonDetail.ogretim_Sekli}
                            </Text>
                        </View>

                        <View style={{ alignItems: "center", backgroundColor: "#e1f5fe", borderColor:"#82b3c9", borderWidth:1, borderRadius: 10, marginTop: 15, paddingBottom: 10, paddingTop: 10 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 17 }}>
                                AKTS
                            </Text>
                            <Text style={{ fontSize: 16, marginTop: 2 }}>
                                {lessonDetail.akts}
                            </Text>
                        </View>
                        <View style={{ alignItems: "center", backgroundColor: "#e1f5fe", borderColor:"#82b3c9",borderWidth:1,  borderRadius: 10, marginTop: 15, paddingBottom: 10, paddingTop: 10 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 17 }}>
                                Kredi
                            </Text>
                            <Text style={{ fontSize: 16, marginTop: 2 }}>
                                {lessonDetail.kredi}
                            </Text>
                        </View>

                        <View style={{ alignItems: "center",backgroundColor: "#e1f5fe", borderColor:"#82b3c9",borderWidth:1, borderRadius:10,marginTop:15,paddingBottom:10,paddingTop:10 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 17 }}>
                                Başlangış Saati
                            </Text>
                            <Text style={{ fontSize: 16 }}>
                                {lesson.ders_Saat_Baslangic}
                            </Text>
                        </View>

                        <View style={{ alignItems: "center",backgroundColor: "#e1f5fe", borderColor:"#82b3c9",borderWidth:1, borderRadius:10,marginTop:15,paddingBottom:10,paddingTop:10 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 17 }}>
                                Bitiş Saati
                            </Text>
                            <Text style={{ fontSize: 16 }}>
                                {lesson.ders_Saat_Bitis}
                            </Text>
                        </View>

                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ alignItems: "center",marginTop:18}}>
                            
                            {
                                dates.map((item, key) => {
                                    return <View style={{ width: "88%", backgroundColor: "red", marginBottom: 5, padding: 5, borderRadius: 10 }}><Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 14, color: "white" }} >{item.hafta_No+". Hafta - "+item.dp_Gun_Ad}</Text></View>
                                })
                            }
                        </View>

                    </View>
                </View>
            </ScrollView>

            <Text>
                {/* {props.state.days} */}
            </Text>

        </View>
    );
}

export default Absence;