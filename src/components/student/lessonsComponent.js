import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import SwipeableItem, { useSwipeableItemParams } from "react-native-swipeable-item";
import { Row, Rows, Table } from 'react-native-table-component';
import LangApp from '../Language';

function LessonsComponent({ ogrNo, navigation ,academicYearSeasson}) {
  useEffect(() => { start() }, [])
  const [lessons, setLessons] = useState([]);
  const [year, setYear] = useState("2022")
  const [seasson, setSeasson] = useState(1)
  const [tableHeader, setTableHeader] = useState(["*", LangApp("Mon"), LangApp("Tue"), LangApp("Wed"), LangApp("Thu"), LangApp("Fri"), LangApp("Sat"), LangApp("Sun")])
  const [hours, setHours] = useState(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"])

  const start = async () => {

    var endpoint = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetStudentSyllabusByStudentNumber/" + ogrNo
    var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
    setLessons([])
    if (rps.data?.length>0) {
     setLessons(rps.data)
   }

   

  }


  return (
    <ScrollView style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Text style={{ width: "100%", paddingBottom: 10, textAlign: "center", color: "blue", fontWeight: "bold", fontSize: 16 }}>{academicYearSeasson} {LangApp("Lessons")}</Text>
      </View>
      <View>
        {lessons?.length==0&&<View style={{alignItems:"center",paddingBottom:20}}>
          <Text style={{color:"orange",fontSize:20 ,fontWeight:"bold"}}>Ders bulunamadı</Text>
          </View>
          }
      </View>

      <Table >
        <Row data={tableHeader} style={styles.head} textStyle={styles.text} />
        {hours?.map((item, key) => {
          let drs = [item, "", "", "", "", "", "", ""]
          var lsn = lessons?.filter(x => { return x.ders_Saat_Baslangic == item });
          if (lsn) {
            for (const itm of lsn) {
              drs.fill(itm.ders_Kod, itm.derslik_Gun + 1, itm.derslik_Gun + 2)
            }
          }
          return (
            <Row key={key} data={drs} textStyle={{ fontSize: 9 }} style={key % 2 == 0 ? { backgroundColor: "#e0e0e0" } : { backgroundColor: "white" }}></Row>
          )
        })

        }

      </Table>
      <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", marginTop: 20, paddingBottom: 50 }}>

        {lessons?.map((item, key) => {
          return <TouchableOpacity key={key} onPress={() => { navigation.navigate('LessonDetail', { dersCode: item.ders_Kod }) }} style={styles.lesson_container}>
            <Text style={{ textAlign: "center", fontWeight: "bold", color: "white" }}>{item.ders_Kod}</Text>
            <Text style={{ textAlign: "center", color: "white", fontStyle: "italic" }}>{item.ders_Adi}</Text>
          </TouchableOpacity>
        })}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6, fontSize: 11 },
  lesson_container: {
    width: "45%",
    margin: 3,
    padding: 3,
    marginBottom: 10,
    paddingBottom: 7,
    paddingTop: 7,
    backgroundColor: "#001ac3",
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center"
  }
});
export default LessonsComponent;