
import React, { Component, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import { Row, Table } from 'react-native-table-component';
import { connect } from 'react-redux';
import LangApp from '../../components/Language';
import ExamPlan from '../../components/student/ExamPlan';
import LessonsComponent from '../../components/student/lessonsComponent';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';



function MyStatus(props) {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rollCalls, setRollCals] = useState([]);
    const [studentBalance, setStudentBalance] = useState("");


    let drm = <View>
        <Text style={{ fontWeight: "bold", textAlign: "center", color: "blue", fontSize: 17, marginTop: 40, marginBottom: 25 }}>{props.Seasson} Dönemi Ödeme İşlemi</Text>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 17 }}>Ödeme Durumu: </Text>
            {studentBalance==0&&  <Text style={{ fontWeight: "bold", fontSize: 17, color: "green" }}> Ödendi</Text>}
            {studentBalance!=0&&  <Text style={{ fontWeight: "bold", fontSize: 17, color: "red" }}> Ödenmedi</Text>}

        </View>
    </View>

    useEffect(() => {
        start()
    }, [])

    const start = async () => {

        var endpoint = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetStudentSyllabusByStudentNumber/" + props.user.detail.ogR_NO
        var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        setLessons(rps.data)
        setTimeout(() => {
            setLoading(false)
        }, 800);
        
        var endpoinRollCalls = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetStudentRollCalls/" + props.user.detail.ogR_NO
        var rpsRollCalls = await GetAxios(endpoinRollCalls).then(x => { return x.data }).catch(x => { return x });
        setRollCals(rpsRollCalls.data)
    
        var studentBalanc = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetStudentBalance/" + props.user.detail.ogR_NO
        var sbalance = await GetAxios(studentBalanc).then(x => { return x.data }).catch(x => { return x });
        setStudentBalance(sbalance.data.data)
        console.log(props)
    }

    const [tabState, setTabState] = React.useState({
        index: 0,
        routes: [
            { key: 'first', title: 'Devam Durumu' },
            { key: 'second', title: 'Ödeme Durumu' },
        ],
    });
    let totalUnjoin = 0;
    let lessonStatus = <ScrollView>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
            <View style={{ alignItems: "center", marginBottom: 10, marginTop: 20 }}>
                <Text style={{ width: "100%", paddingBottom: 10, textAlign: "center", color: "blue", fontWeight: "bold", fontSize: 16 }}>{props.academicYearSeasson} {LangApp("AcademicCalendar")}</Text>
            </View>

            {lessons.map((item, key) => {
                var lssnD=rollCalls?.filter((x)=>{return x.ders_Kod==item.ders_Kod })
                let rnd =  lssnD.length;  

                totalUnjoin = +rnd;
                return <View key={key} style={{ flexDirection: "column", backgroundColor: "white", justifyContent: "center", alignItems: "center", width: "97%", borderColor: "blue", borderWidth: 1, borderStyle: "dashed", marginBottom: 20, paddingBottom: 20, paddingTop: 20 }}>
                    <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => props.navigation.navigate("Absence", { detail: lssnD, lesson: item })} style={{ position: "absolute", bottom: 15, right: 15, backgroundColor: "blue", padding: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "white" }}>Detay</Text>
                    </TouchableOpacity>
                    <View>
                        <Text style={{ fontWeight: "bold", fontSize: 17 }}>{item.ders_Adi}</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 15 }}>({item.ders_Kod})</Text>
                    </View>
                    <View>
                        <Text style={[{ fontSize: 17, marginTop: 5, padding: 5, color: "red", fontWeight: "bold" },]}>-{rnd} Ders</Text>
                    </View>

                </View>
            })}

        </View>
    </ScrollView>

    const _handleIndexChange = (index) => { setTabState({ ...tabState, index }) };

    const _renderScene = SceneMap({
        first: () => lessonStatus,
        second: () => drm,
    });
    if (loading) {
        return <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
            <Image source={require("../../assets/loading.gif")} style={{ width: 70, height: 70 }}></Image>
        </View>
    }
    return (
        <TabView
            navigationState={tabState}
            renderScene={_renderScene}
            // renderTabBar={_renderTabBar}
            onIndexChange={_handleIndexChange}
        />

    );

}
const mapStateToProps = (state) => {
    return {
        user: state
    }
}
const mapDispatchToProps = (dispatch) => {

    return {

        changeUser: (data) => dispatch({ type: "UserData", payload: data })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyStatus);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff', fontWeight: "bold" },
    wrapper: { flexDirection: 'row' },
    title: { flex: 2, backgroundColor: '#f6f8fa' },
    row: { height: 28 },
    text: { textAlign: 'center', fontSize: 16, fontWeight: "bold" }
});