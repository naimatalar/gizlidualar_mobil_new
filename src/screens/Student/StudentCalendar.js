
import React, { Component, useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import { connect } from 'react-redux';
import LangApp from '../../components/Language';
import ExamPlan from '../../components/student/ExamPlan';
import getAcademicTerm from '../../components/student/getAcademicTerm';
import LessonsComponent from '../../components/student/lessonsComponent';

 

function StudentCalendar(props) {
  const [loading, setLoading] = useState(true);

    const _renderScene = SceneMap({
        first: () => <LessonsComponent navigation={props.navigation} ogrNo={props.user.detail.ogR_NO} academicYearSeasson={ getAcademicTerm(props)}></LessonsComponent>,
        second: ()=><ExamPlan academicYearSeasson={getAcademicTerm(props)}></ExamPlan>,
    });
    const layout = useWindowDimensions();
    const [tabState, setTabState] = React.useState({
        index: 0,
        routes: [
            { key: 'first', title: 'Ders Programı'},
            { key: 'second', title: 'Etkinlik Takvimi'  },
        ],
    });
    useEffect((item,key)=>{
      setTimeout(() => {
        setLoading(false)
    }, 800);
    })

    const _handleIndexChange = (index) => { setTabState({ ...tabState, index }) };


      if (loading) {
        return <View style={{justifyContent:"center",alignItems:"center",marginTop:50}}>
           <Image source={ require("../../assets/loading.gif")} style={{width:70,height:70}}></Image>
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
export default connect(mapStateToProps, mapDispatchToProps)(StudentCalendar);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff', fontWeight: "bold" },
    wrapper: { flexDirection: 'row' },
    title: { flex: 2, backgroundColor: '#f6f8fa' },
    row: { height: 28 },
    text: { textAlign: 'center' }
});