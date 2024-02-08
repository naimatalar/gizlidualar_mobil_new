import * as React from 'react';
import { Button, SafeAreaView, Text, TouchableOpacity, View, Image, Animated, StyleSheet, Easing, ImageBackground } from 'react-native';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import { NavigationContainer, StackRouter } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import StudentHomeScreen from './StudentHomeScreen';
import Logo from '../../components/Logo';
import LangApp from '../../components/Language';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudentExamsScreen from './StudentExamsScreen';
import StudentLessonScores from './StudentLessonScores';
import StudentCalendar from './StudentCalendar';
import { createStackNavigator } from '@react-navigation/stack';
import LessonDetail from './LessonDetail';
import MyStatus from './MyStatus';
import Absence from './Absence';
import InformationAcademician from './InformationAcademician';
import ExamPlan from '../../components/student/ExamPlan';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
// import LoginControl from '../../components/LoginControl';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
export default function StudentNav({ initialData }) {
  const INPUT_RANGE_START = 0;
  const INPUT_RANGE_END = 1;
  const OUTPUT_RANGE_START = -281;
  const OUTPUT_RANGE_END = 0;
  const ANIMATION_TO_VALUE = 1;
  const ANIMATION_DURATION = 25000;
  const initialValue = 0;
  const [logOut, setLogOut] = React.useState();

  const translateValue = React.useRef(new Animated.Value(initialValue)).current;
  useEffect(() => {



    setInterval(async () => {
      var sasa = (await apiConstant.BaseUrl()).integration + "/api/domain/check"
      var rps = await GetAxios(sasa).then(x => { return x.data }).catch(x => { return false });
      
      if (rps == false) {
        Updates.reloadAsync()

      } else {
        if (!rps.data.isAuth) {
          Updates.reloadAsync()
        }
      }
    }, 20000);
    const translate = () => {
      translateValue.setValue(initialValue);
      Animated.timing(translateValue, {
        toValue: ANIMATION_TO_VALUE,
        duration: ANIMATION_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => translate());
    };

    translate();
  }, [translateValue]);


  const translateAnimation = translateValue.interpolate({
    inputRange: [INPUT_RANGE_START, INPUT_RANGE_END],
    outputRange: [OUTPUT_RANGE_START, OUTPUT_RANGE_END],
  });

  const initialState = initialData;

  const userReduccer = (state = initialState, action) => {
    switch (action.type) {
      case "SetUserData":
        return {
          data: action.payload.data,
        };
      default:
        return state;
    }
  };
  const AppStack = createStackNavigator();



  const store = createStore(userReduccer);
  const MyDrawer = () => {
    return (<Drawer.Navigator screenOptions={{ headerShown: true }} drawerContent={(props) => (

      <View style={{ flex: 1 }}>

        <SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }} style={{ flex: 1 }}>
          <View style={{ flexDirection: "column", flex: 1 }}>
            <View>
              <View style={{ marginBottom: 5, marginTop: 25, flexDirection: "row", justifyContent: "center" }}>
                <Logo />
              </View>
              <View style={{ marginBottom: 20, flexDirection: "row", justifyContent: "center", borderColor: "#cfd8dc", borderBottomWidth: 1, borderStyle: "solid", paddingBottom: 10 }}>
                <Text style={{ color: "#001ac3", fontWeight: "bold", fontSize: 16 }}>{LangApp("LogoText")}</Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: "column" }}>
              <DrawerItemList   {...props} />
            </View>
            <View>
              <View style={{ marginBottom: 25, flexDirection: "column" }}>
                <TouchableOpacity style={{ alignSelf: "center", marginBottom: 5, flexDirection: "column", borderRadius: 5, width: "98%", height: 35, justifyContent: "center" }} onPress={async () => { await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x }); Updates.reloadAsync() }} >
                  <Text style={{ textAlign: "center", fontWeight: 'bold', color: "#ff7043" }}><Icon name="sign-out" size={16} color="#ff7043" /> Log Out</Text>
                </TouchableOpacity>
              </View>
            </View> 
          </View>
        </SafeAreaView>
      </View>
    )} initialRouteName="StudentHomeScreen">
      <Drawer.Screen name="StudentHomeScreen" options={{ drawerIcon: () => <Icon name="id-badge" size={30} color="#4a0072" />, drawerLabel: LangApp("MyProfile"), title: LangApp("MyProfile") }} component={StudentHomeScreen} />
      <Drawer.Screen name="StudentExamsScreen" options={{ drawerIcon: () => <Icon name="calendar" size={24} color="#004d40" />, drawerLabel: LangApp("Calendar"), title: LangApp("Calendar") }} component={StudentCalendar} />
      <Drawer.Screen name="StudentLessonScores" options={{ drawerIcon: () => <Icon name="book" size={24} color="#b53d00" />, drawerLabel: LangApp("MyLessons"), title: LangApp("MyLessons") }} component={StudentLessonScores} />
      <Drawer.Screen name="MyStatus" options={{ drawerIcon: () => <Icon name="universal-access" size={24} color="#8c0032" />, drawerLabel: LangApp("Info"), title: LangApp("Info") }} component={MyStatus} />
      {/* <Drawer.Screen  name="ClassAttendancew" options={{ drawerIcon: () => <Icon name="credit-card"  size={20} color="#0d47a1" /> ,drawerLabel:LangApp("PayStatus"),title:LangApp("PayStatus")}} component={StudentHomeScreen} /> */}
      <Drawer.Screen name="InformationAcademician" options={{ drawerIcon: () => <Icon name="graduation-cap" size={20} color="#790e8b" />, drawerLabel: LangApp("Counselor"), title: LangApp("Counselor") }} component={InformationAcademician} />
      <Drawer.Screen name="ClassAttendancesws" options={{ drawerIcon: () => <Icon name="bell" size={24} color="red" />, drawerLabel: LangApp("Notifications"), title: LangApp("Notifications") }} component={ExamPlan}

      />


    </Drawer.Navigator>)
  }
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppStack.Navigator initialRouteName="Drawer">
          <AppStack.Screen name="Geri" options={{ headerShown: false }} component={MyDrawer} />
          <AppStack.Screen name="LessonDetail" component={LessonDetail} />
          <AppStack.Screen name="Absence" component={Absence} />
          <AppStack.Screen name="StudentLessonScores_" options={{ title: LangApp("MyLessons") }} component={StudentLessonScores} />
          <AppStack.Screen name="InformationAcademician_" options={{ title: LangApp("Counselor") }} component={InformationAcademician} />
        </AppStack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
const styles = StyleSheet.create({

  background: {
    position: 'absolute',
    zIndex: 1,
    width: 1200,
    height: 1200,
    top: 0,
    opacity: 0.2,
    transform: [
      {
        translateX: 0,
      },
      {
        translateY: 0,
      },
    ],
  },
});