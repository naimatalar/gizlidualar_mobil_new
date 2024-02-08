

import React, { Component, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, useWindowDimensions, View, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import LangApp from '../Language';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';


function ExamPlan({ academicYearSeasson }) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        start()

    }, [])
    const start = async () => {
        var endpoint = (await apiConstant.BaseUrl()).integration + "/api/UniversityAllInformation/GetAllActivityList"
        var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        setEvents(rps.data)
    }


    return (
        <View style={{ flexDirection: "column" }}>

            <Text style={{ width: "100%", paddingBottom: 20, paddingTop: 20, textAlign: "center", color: "blue", fontWeight: "bold",fontSize:16 }}>{academicYearSeasson} {LangApp("AcademicCalendar")}</Text>

            <View style={{ flexDirection: "row" }}>
                <ScrollView style={{ flexDirection: "column", flex: 1 }}>
                    {events.map((item, key) => {
                        var isGrey = key % 2 == 0;
                        var sDate = new Date(item.activityStartDate)
                        var eDate = new Date(item.activityEndDate)
                        var startDate = sDate.getDay() + "/" +sDate.getMonth() +"/"+sDate.getFullYear() 
                        var endDate = eDate.getDay() + "/" +eDate.getMonth() +"/"+eDate.getFullYear() 

                        return <View key={key} style={[isGrey ? styles.greyRow : {}, styles.col]}>

                            <View style={styles.rowContent}>
                                <View style={{ width: 45, height: 45, backgroundColor: "white", justifyContent: "center", alignItems: "center", borderRadius: 100, paddingLeft: 5, marginRight: 10 }}>
                                    <Text><Icon name="bell" size={20} color="blue" /> </Text>
                                </View>
                                <View style={{ justifyContent: "center", width: "83%" }}>
                                    <Text style={styles.rowText}>{item.activitySubjectName} </Text>
                                </View>
                            </View>
                            <View style={styles.rowContentDate}>
                                {
                                    item.activityStartDate && item.activityEndDate && <Text style={styles.rowTextDate}><Icon name="calendar" size={11} color="black" /> {startDate} - {endDate} </Text>
                                }
                                {
                                    !item.activityEndDate && <Text style={styles.rowTextDate}><Icon name="calendar" size={11} color="black" /> {start}  </Text>
                                }


                            </View>
                        </View>
                    })}
                </ScrollView>
            </View>

        </View>

    );
}

export default ExamPlan

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff', fontWeight: "bold" },
    wrapper: { flexDirection: 'row' },
    title: { flex: 2, backgroundColor: '#f6f8fa' },
    col: { paddingLeft: 5, paddingRight: 5, paddingBottom: 0, paddingTop: 20 },
    rowContent: { textAlign: 'center', flexDirection: "row", marginBottom: 5 },
    rowContentDate: { textAlign: 'center', flexDirection: "row", justifyContent: "flex-end" },
    greyRow: { backgroundColor: "#e0e0e0" },
    rowText: { fontSize: 15, marginBottom: 5 },
    rowTextDate: { fontSize: 13, color: "grey", width: 183, padding: 4, fontStyle: "italic", marginBottom: 5, textAlign: "right" }
});