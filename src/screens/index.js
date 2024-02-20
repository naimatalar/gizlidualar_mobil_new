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
import CoinCounter from './globalScreens/CoinCounter';
import apiConstant from '../helpers/dataApi/apiConstant';
import { GetAxios } from '../helpers/dataApi/crud';
// import { getLocales } from 'expo-localization';

LogBox.ignoreLogs(['Warning']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
let infoButton = ({ navigation }) => <TouchableOpacity onPress={() => { navigation.navigate("Info") }} style={{ alignItems: "center", borderRadius: 17, marginRight: 10, padding: 6 }}>

  <MaterialCommunityIcons
    name={"alert"}
    size={24}
    color={"#297be9"}
  />
  <Text style={{ color: "#297be9", textAlign: "center", fontSize: 8 }}>BİLGİLENDİRME</Text>
</TouchableOpacity>
const HomeStack = createStackNavigator();
function HomeStackScreen({setCoin,start}) {
  return (
    <HomeStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      <HomeStack.Screen name="Home" options={(e) => ({ title: "Gizli Dualar", headerRight: () => infoButton(e) })} component={Home} />
      <HomeStack.Screen options={(e) => ({ title: e.route.params.name, headerRight: () => infoButton(e) })} name="CategoryDetail" component={Detail} />
      <HomeStack.Screen name="Steps" options={(e) => ({ title: "Dua Adımları", headerRight: () => infoButton(e) })} component={(c)=><Steps {...c} setCoin={setCoin}></Steps>} />
      <SginInStack.Screen name="Coin" options={{ title: "Koin" }} component={(c)=><CoinScreen {...c} start={start}></CoinScreen>} />
      <HomeStack.Screen name="Info" options={{ title: "Gizli Dualar Nedir" }} component={AboutGizliDualar} />
    </HomeStack.Navigator>
  );
}





const SginInStack = createStackNavigator();

function SginInStackStackScreen({ isLogin, start }) {

  return (
    <SginInStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      {!isLogin && <SginInStack.Screen name="SginIn" options={{ title: "Üye Ol / Giriş Yap", headerShown: false }} component={() => <SginIn start={start}></SginIn>} />
      }
      {isLogin && <SginInStack.Screen name="Profil" options={{ title: "Profil" }} component={SginIn} />
      }
      {isLogin && <SginInStack.Screen name="Coin" options={{ title: "Koin" }} component={CoinScreen} />
      }

      <HomeStack.Screen name="Info" options={{ title: "Gizli Dualar", headerRight: infoButton }} component={AboutGizliDualar} />

    </SginInStack.Navigator>
  );
}
const UserStack = createStackNavigator();

function USerStackStackScreen({ isLogin,start }) {

  return (
    <UserStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      <UserStack.Screen name="Profile" options={(e) => ({ title: "Profil", headerRight: () => infoButton(e) })} component={(c)=><User {...c} start={start}></User>} />
    </UserStack.Navigator>
  );
}
const CoinStack = createStackNavigator();

function CoinStackStackScreen({ isLogin ,setCoin}) {

  return (
    <UserStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      <UserStack.Screen name="Profile" options={(e) => ({ title: "Anahtar", headerRight: () => infoButton(e) })}  component={(c)=><CoinScreen {...c} setCoin={setCoin}></CoinScreen>} />
    </UserStack.Navigator>
  );
}


const Tab = createBottomTabNavigator();

export default function Index({ startBase }) {
  const [isLogin, setIsLogin] = React.useState(false)
  const [refresh, setRefresh] = React.useState()
  const [coin, setCoin] = React.useState(0)


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
    state={data:{lang:"ln"}}
   }
    
    switch (action.type) {
      case "UserData":
        action.payload.UserData.lang=ln
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
              }
              
              let sty = {}
              if (route.name === 'Profile'||route.name==="SignIn") {
                sty = { backgroundColor: "#d3e0f2", width: 60, height: 60, marginTop: -5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
              }
              if (route.name === 'Coin') {
                sty = { backgroundColor: "#A5D6A7", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
              }
              if (route.name === 'HomeStack') {
                sty = { backgroundColor: "#FFCCBC", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
              }
              
              const tabBarIcon = useSelector(state => state);
             
              return (
                <View style={
                  sty

                }>
                 
                  <MaterialCommunityIcons

                    name={iconName}
                    size={route.name === 'Profile'?35:25}
                    color={color}
                  />
                </View>

              );

            }
          })

          }>
          <Tab.Screen options={{ tabBarLabel:"", headerShown: false, title: "Gizli Dualar" }} name="HomeStack" component={(c)=><HomeStackScreen {...c} start={start} setCoin={setCoin}></HomeStackScreen>} />
          {!isLogin && <Tab.Screen options={{ tabBarLabel: "", title: "Üye Ol / Giriş Yap" }} name="SignIn" component={() => <SginInStackStackScreen isLogin={isLogin} start={startBase}></SginInStackStackScreen>} />
          }
          {isLogin && <Tab.Screen options={{ tabBarLabel: "", title: "Profil", headerShown: false }} name="Profile" component={() => <USerStackStackScreen start={startBase} isLogin={isLogin}></USerStackStackScreen>} />
          }
          {isLogin && <Tab.Screen options={{ tabBarLabel: "", title: "Koin", headerShown: false, tabBarBadge: coin, tabBarBadgeStyle: { marginTop: -15,marginLeft:11,height:30,paddingTop:6,fontSize:12,borderRadius:15} }} name="Coin" component={() => <CoinStackStackScreen setCoin={setCoin} start={start} isLogin={isLogin}></CoinStackStackScreen>} />
          }




        </Tab.Navigator >
      </NavigationContainer>
    </Provider>
  );
}