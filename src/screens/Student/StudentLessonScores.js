
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
import Icon from 'react-native-vector-icons/FontAwesome';
import getAcademicTerm from '../../components/student/getAcademicTerm';


function StudentLessonScores(props) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupLesson, setGroupLesson] = useState();
  const [syllabus, setSyllabus] = useState([]);


  useEffect(() => {
    start()
  }, [])

  const start = async () => {

    var endpoint = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetStudentNotesByStudentNumber/" + props.user.detail.ogR_NO
    var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
    if (rps.data.length == 0) {
      setLoading(false)
      setLessons([])
      // return false
    }


    var endpoint2 = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetStudentLessonByStudentNumber/" + props.user.detail.ogR_NO
    var rps2 = await GetAxios(endpoint2).then(x => { return x.data }).catch(x => { return x });
    if (rps2.data.length == 0) {
      setLoading(false)
      setSyllabus([])

    } else {
      setSyllabus(rps2.data)
    }
    console.log(rps2.data)

    var prdata = rps.data
    var drs = []
    for (const key of prdata) {

      var ss = drs.filter(x => { return x.ders_Kod == key.ders_Kod }).length > 0
      if (!ss) {
        drs.push(key)
      }
    }


    const groupByCategory = prdata.reduce((group, prdata) => {
      const { ders_Kod } = prdata;


      group[ders_Kod] = group[ders_Kod] ?? [];
      group[ders_Kod].push(prdata);
      return group;
    }, {});

    setLessons(drs)
    setGroupLesson(groupByCategory)

    // setLessons([])
    // setGroupLesson([])

    setTimeout(() => {
      setLoading(false)
    }, 800);
  }
  let colorRnd = ["#4527a0", "#560027", "#4a0073", "#870000", "#003d00", "#004c40", "#c63f17", "#524c00", "#7200ca"]


  if (loading) {
    return <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
      <Image source={require("../../assets/loading.gif")} style={{ width: 70, height: 70 }}></Image>
    </View>
  }
  return (
    <ScrollView>


      <View style={{ alignItems: "center", marginBottom: 10, marginTop: 18 }}>
        <Text style={{ width: "100%", paddingBottom: 10, textAlign: "center", color: "blue", fontWeight: "bold", fontSize: 20 }}>{props.academicYearSeasson} {getAcademicTerm(props) + " " + LangApp("Lessons")}</Text>

      </View>
      {lessons.length == 0 &&
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 20, color: "orange", fontWeight: "bold" }}>Ders notları henüz girilmedi</Text>
        </View>
      }
 
      <View style={{ padding: 20,flexDirection:"row" ,width:"100%",flexWrap:"wrap",justifyContent:"space-between",borderBottomColor:"black",borderBottomWidth:1,marginBottom:20}}>
        {syllabus?.map((item, key) => {
          let drm = ""
          if (item.ders_Kayit_Durum == 0) {
            drm=<Text style={{color:"red"}}>Öğrenci Ve Danışmanı Onayı Yapılamdı</Text>
          }else if (item.ders_Kayit_Durum == 1) {
            drm=<Text style={{color:"red"}}>Danışmanı Onayı Yapılamdı</Text>
          }else if (item.ders_Kayit_Durum == 2) {
            drm=<Text style={{color:"green"}}>Onaylandı</Text>
          }

          return <View key={key} style={{ borderColor: "blue", borderStyle: "solid", borderWidth: 1,width:"48%", marginBottom: 10, padding: 5 }}>
            <Text>{item.ders_Adi}</Text>
            <View style={{marginTop:5}}>
              <Text style={{fontWeight:"bold"}}>Durum: {drm}</Text>
            </View>
            <View style={{marginTop:5}}>
              <Text style={{fontWeight:"bold"}}>Akts: {item.ders_Akts }</Text>
            </View>

          </View>
        })}
      </View>
      {lessons.length > 0 &&
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" ,marginBottom:10}}>Der Notlarım</Text>
        </View>
      }
      {lessons?.map((item, key) => {

        // let LessonStatus = fakeData[key][3] > 45 && <View><Text style={{ textAlign: "center", fontWeight: "bold", color: "green", marginBottom: 7 }}>Geçti</Text></View> || <View ><Text style={{ textAlign: "center", fontWeight: "bold", color: "red", marginBottom: 7 }}> Kaldı</Text></View>
        var sinav_tip = groupLesson[item.ders_Kod]?.map((item, key) => { return item.sinav_Tipi })
        var sonuc = groupLesson[item.ders_Kod]?.map((item, key) => { return item.not_Deger })

        var gecmeDurum = item.gecme_Durum
        if (item.gecme_Durum == "Sonuçlandırılmadı") {
          gecmeDurum = <Text style={{ color: "orange", fontWeight: "bold" }}>Sonuçlandırılmadı</Text>
        } else if (item.gecme_Durum == "Geçti") {
          gecmeDurum = <Text style={{ color: "green", fontWeight: "bold" }}>Geçti</Text>
        } else if (item.gecme_Durum == "Kaldı") {
          gecmeDurum = <Text style={{ color: "red", fontWeight: "bold" }}>Kaldı</Text>
        }




        return <View key={key} style={{ marginBottom: 60 }}>
          <TouchableOpacity onPress={() => { props.navigation.navigate('LessonDetail', { dersCode: item.ders_Kod }) }} style={{ backgroundColor: colorRnd[Math.floor(Math.random() * 8)], flexDirection: "row", justifyContent: "space-between", paddingLeft: 5, paddingRight: 5 }}>
            <Text style={{ textAlign: "center", color: "white", fontSize: 18, paddingBottom: 10, paddingTop: 10 }}>
              {item.ders_Kod}
            </Text>
            <Text style={{ textAlign: "center", color: "white", fontSize: 18, paddingBottom: 10, paddingTop: 10, paddingRight: 10 }}>
              <Icon name="search" size={20} color="white" />
            </Text>

          </TouchableOpacity>
          <View>
            <Table>
              <Row data={sinav_tip} style={styles.head} textStyle={styles.text} />


              <Row key={key} data={sonuc} textStyle={{ fontSize: 14, textAlign: "center", paddingTop: 10, paddingBottom: 10 }} ></Row>



              <Row data={["", "", "", "", ""]} textStyle={{ fontSize: 14, textAlign: "center", fontWeight: "bold", fontStyle: "italic" }} style={{ backgroundColor: "white" }}></Row>
              <Row data={["", "Durum", gecmeDurum]} textStyle={{ fontSize: 14, textAlign: "center", marginBottom: 7, fontWeight: "bold", fontStyle: "italic" }} style={{ backgroundColor: "white" }}></Row>
            </Table>
          </View>


        </View>

      })}
    </ScrollView>
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
export default connect(mapStateToProps, mapDispatchToProps)(StudentLessonScores);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#f1f8ff', fontWeight: "bold" },
  wrapper: { flexDirection: 'row' },
  title: { flex: 2, backgroundColor: '#f6f8fa' },
  row: { height: 28 },
  text: { textAlign: 'center', fontSize: 16, fontWeight: "bold" }
});