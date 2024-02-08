import { StyleSheet, Text, View } from "react-native"
import { Calendar } from "react-native-calendars"
import { connect } from "react-redux"
import WeeklyCalendar from 'react-native-weekly-calendar';
function StudentExamsScreen(props) {
    const sampleEvents = [
        { 'start': '2022-12-23 09:00:00', 'duration': '00:20:00', 'note': 'Walk my dog' },
        { 'start': '2022-12-24 14:00:00', 'duration': '01:00:00', 'note': 'Doctor\'s appointment' },
        { 'start': '2022-12-25 08:00:00', 'duration': '00:30:00', 'note': 'Morning exercise' },
        { 'start': '2022-12-25 14:00:00', 'duration': '02:00:00', 'note': 'Meeting with client' },
        { 'start': '2022-12-25 19:00:00', 'duration': '01:00:00', 'note': 'Dinner with family' },
        { 'start': '2022-12-26 09:30:00', 'duration': '01:00:00', 'note': 'Schedule 1' },
        { 'start': '2022-12-26 11:00:00', 'duration': '02:00:00', 'note': 'Schedule 2' },
        { 'start': '2022-12-26 15:00:00', 'duration': '01:30:00', 'note': 'Schedule 3' },
        { 'start': '2022-12-26 18:00:00', 'duration': '02:00:00', 'note': 'Schedule 4' },
        { 'start': '2022-12-26 22:00:00', 'duration': '01:00:00', 'note': 'Schedule 5' }
    ]


    return (
        <View style={styles.container}>
            <WeeklyCalendar  locale={"tr"} events={sampleEvents} style={{ height: "100%" }} />
        
    </View>)
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

export default connect(mapStateToProps, mapDispatchToProps)(StudentExamsScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});