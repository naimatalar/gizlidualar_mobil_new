import * as React from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons
  from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './globalScreens/home';
import Detail from './globalScreens/Detail';
import Steps from './globalScreens/Steps';
import SginIn from './globalScreens/SignIn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AboutGizliDualar } from './globalScreens/AboutGizliDualar';
import User from './globalScreens/User';
import { LogBox } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { createStore } from 'redux';
import CoinScreen from './globalScreens/CoinScreen';

import apiConstant from '../helpers/dataApi/apiConstant';
import { GetAxios } from '../helpers/dataApi/crud';
import { DeviceLanguage, LangApp } from '../components/Language';
import FilterListSc from './globalScreens/FilterList';
import Kisilik from './globalScreens/Kisilik';

// import { getLocales } from 'expo-localization';

LogBox.ignoreLogs(['Warning']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
let infoButton = ({ navigation }) => <TouchableOpacity onPress={() => { navigation.navigate("Info") }} style={{ alignItems: "center", borderRadius: 17, marginRight: 10, padding: 6 }}>

  <MaterialCommunityIcons
    name={"alert"}
    size={24}
    color={"#297be9"}
  />
  <Text style={{ color: "#297be9", textAlign: "center", fontSize: 11 }}>{LangApp("blBig")}</Text>
</TouchableOpacity>
const HomeStack = createStackNavigator();
function HomeStackScreen({ setCoin, start }) {

  return (
    <HomeStack.Navigator screenOptions={{ headerBackTitle: LangApp("geri") }}>
      <HomeStack.Screen name="Home" options={(e) => ({ title: LangApp("gd"), headerRight: () => infoButton(e) })} component={Home} />
      <HomeStack.Screen options={(e) => ({ title: e.route.params.name, headerRight: () => infoButton(e) })} name="CategoryDetail" component={Detail} />

      <HomeStack.Screen name="Steps" options={(e) => ({ title: "Dua Adımları", headerRight: () => infoButton(e) })} component={(c) => <Steps {...c} setCoin={setCoin}></Steps>} />
      <SginInStack.Screen name="Coin" options={{ title: LangApp("anahtar")  }} component={(c) => <CoinScreen {...c} start={start}></CoinScreen>} />
      <HomeStack.Screen name="Info" options={{ title: "Gizli Dualar Nedir" }} component={AboutGizliDualar} />

    </HomeStack.Navigator>
  );
}

const FilterListStack = createStackNavigator();
function FilterListStackScreeen({ setCoin }) {

  return (
    <FilterListStack.Navigator screenOptions={{ headerBackTitle: LangApp("geri") }}>
      <FilterListStack.Screen name="FilterList" options={(e) => ({ headerRight: () => infoButton(e), title: LangApp("duaListesi") })} component={FilterListSc} />
      <HomeStack.Screen name="Steps" options={(e) => ({ title: "Dua Adımları", headerRight: () => infoButton(e) })} component={(c) => <Steps {...c} setCoin={setCoin}></Steps>} />

    </FilterListStack.Navigator>
  );
}


const KisilikStack = createStackNavigator();
function KisilikStackScreeen({ setCoin }) {

  return (
    <KisilikStack.Navigator screenOptions={{ headerBackTitle: LangApp("geri") }}>
      <KisilikStack.Screen name="Kisilik" options={(e) => ({ headerRight: () => infoButton(e), title: LangApp("kisilik") })} component={(c) => <Kisilik {...c} setCoin={setCoin}></Kisilik>} />

    </KisilikStack.Navigator>
  );
}





const SginInStack = createStackNavigator();

function SginInStackStackScreen({ isLogin, start }) {

  return (
    <SginInStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      {!isLogin && <SginInStack.Screen name="SginIn" options={{ title: LangApp("uyeGiris"), headerShown: false }} component={() => <SginIn start={start}></SginIn>} />
      }
      {isLogin && <SginInStack.Screen name="Profil" options={{ title: "Profil" }} component={SginIn} />
      }
      {isLogin && <SginInStack.Screen name="Coin" options={{ title: "Koin" }} component={CoinScreen} />
      }

      <HomeStack.Screen name="Info" options={{ title: LangApp("gd"), headerRight: infoButton }} component={AboutGizliDualar} />

    </SginInStack.Navigator>
  );
}
const UserStack = createStackNavigator();

function USerStackStackScreen({ setCoin, start }) {

  return (
    <UserStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      <UserStack.Screen name="Profile" options={(e) => ({ title: "Profil", headerRight: () => infoButton(e) })} component={(c) => <User {...c} start={start}></User>} />
      <HomeStack.Screen name="Steps" options={(e) => ({ title: "Dua Adımları", headerRight: () => infoButton(e) })} component={(c) => <Steps {...c} setCoin={setCoin}></Steps>} />

    </UserStack.Navigator>
  );
}
const CoinStack = createStackNavigator();

function CoinStackStackScreen({ isLogin, setCoin,start }) {

  return (
    <UserStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      <UserStack.Screen name="Profile" options={(e) => ({ title: "Anahtar", headerRight: () => infoButton(e) })} component={(c) => <CoinScreen start={start} {...c} setCoin={setCoin}></CoinScreen>} />
    </UserStack.Navigator>
  );
}


const Tab = createBottomTabNavigator();

export default function Index({ startBase }) {
  const [isLogin, setIsLogin] = React.useState(false)
  const [refresh, setRefresh] = React.useState()
  const [coin, setCoin] = React.useState(0)


  let coinBadgeStyle = { marginTop: -18, marginLeft: -6, height: 30, paddingTop: 6, fontSize: 12, borderRadius: 15 }

  if (DeviceLanguage == "ar") {
    coinBadgeStyle = { marginTop: -18, marginLeft: -60, height: 30, paddingTop: 6, fontSize: 12, borderRadius: 15 }
  }

  React.useEffect(() => {

    start();
  }, [startBase])


  const start = async () => {
  
    // await AsyncStorage.removeItem("hlcapptokengDua") 
    var tkn = await AsyncStorage.getItem("hlcapptokengDua")
    if (tkn) {
      setIsLogin(true)
      var endpoint = await apiConstant.BaseUrl + `/api/usermanager/getcurrentusercoin/`
      var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });

      setCoin(rps.data)

    }



  }
  const initialState = {};
  const userReduccer = (state, action) => {

    //   var lcl=getLocales();

    //  var ln=lcl[0].languageCode

    if (!state) {
      state = { data: { lang: "ln" } }
    }

    switch (action.type) {
      case "UserData":
        action.payload.UserData.lang = ln
        return {
          data: action.payload.UserData,

        };
      default:
        return state;
    }
  };




  const store = createStore(userReduccer);
  return (
    <Provider store={store}>
      <NavigationContainer  >
        <Tab.Navigator

          initialRouteName="HomeStack"
          screenOptions={({ route }) => ({

            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'HomeStack') {
                iconName = focused
                  ? 'animation'
                  : 'animation-outline';
              } else if (route.name === 'SignIn') {
                iconName = focused
                  ? 'account-lock'
                  : 'account-lock-outline';
              } else if (route.name === 'Profile') {
                iconName = focused
                  ? 'account'
                  : 'account-outline';
              } else if (route.name === 'Coin') {
                iconName = focused
                  ? 'key'
                  : 'key-outline';
              } else if (route.name === 'FilterList') {
                iconName = focused
                  ? 'view-list'
                  : 'view-list-outline';
              } else if (route.name === 'Kisilik') {
                iconName = focused
                  ? 'pentagram'
                  : 'pentagram';
              }

              let sty = {}
              let incSize = 30
              if (route.name === 'Profile') {
                sty = { backgroundColor: "#d3e0f2", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "blue"
                  sty.width = 60
                  sty.height = 60
                  incSize = 42
                }

              }
              if (route.name === "SignIn") {
                sty = { backgroundColor: "#d3e0f2", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "blue"
                  sty.width = 60
                  sty.height = 60
                  incSize=42
                }
              }

              // if (route.name === 'Coin') {
              //   sty = { backgroundColor: "#A5D6A7", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
              //   if (focused) {
              //     sty.marginTop = 1
              //     sty.borderWidth = 1
              //     sty.borderColor = "#00695C"
              //     sty.width = 60
              //     sty.height = 60
              //     incSize=42
              //   }
              // }
              if (route.name === 'HomeStack') {
                sty = { backgroundColor: "#FFCCBC", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "#FF3D00"
                  sty.width = 60
                  sty.height = 60
                  incSize=42
                }
              }
              if (route.name === 'FilterList') {
                sty = { backgroundColor: "#E1BEE7", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "#FF3D00"
                  sty.width = 60
                  sty.height = 60
                  incSize=42
                }
              }
              if (route.name === 'Kisilik') {
                sty = { backgroundColor: "#AEEA00", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "#FF3D00"
                  sty.width = 60
                  sty.height = 60
                  incSize=42
                }
              }









              return (
                <View style={
                  sty

                }>

                  <MaterialCommunityIcons

                    name={iconName}
                    size={incSize}
                    color={color}
                  />
                </View>

              );

            }
          })

          }>
          <Tab.Screen options={{ tabBarLabel: "", title: "Kişilik", headerShown: false }} name="Kisilik" component={(c) => <KisilikStackScreeen setCoin={setCoin} {...c}></KisilikStackScreeen>} />

          <Tab.Screen options={{ tabBarLabel: "", title: "Dualar", headerShown: false }} name="FilterList" component={(c) => <FilterListStackScreeen setCoin={setCoin} {...c}></FilterListStackScreeen>} />

          <Tab.Screen options={{ tabBarLabel: "", headerShown: false, title: LangApp("gd") }} name="HomeStack" component={(c) => <HomeStackScreen {...c} start={start} setCoin={setCoin}></HomeStackScreen>} />
          {!isLogin && <Tab.Screen options={{ tabBarLabel: "", title: LangApp("uyeGiris") }} name="SignIn" component={() => <SginInStackStackScreen isLogin={isLogin} start={startBase}></SginInStackStackScreen>} />
          }
          {isLogin && <Tab.Screen options={{ tabBarLabel: "", title: "Profil", headerShown: false }} name="Profile" component={() => <USerStackStackScreen start={startBase} setCoin={setCoin}></USerStackStackScreen>} />
          }
          {/* {isLogin && <Tab.Screen options={{ tabBarLabel: "", title: LangApp("anahtar") , headerShown: false, tabBarBadge: coin, tabBarBadgeStyle: coinBadgeStyle }} name="Coin" component={() => <CoinStackStackScreen setCoin={setCoin} start={start} isLogin={isLogin}></CoinStackStackScreen>} />
          } */}




        </Tab.Navigator >
      </NavigationContainer>
    </Provider>
  );
}