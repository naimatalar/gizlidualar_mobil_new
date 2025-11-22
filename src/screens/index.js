import * as React from 'react';
import { Button, Text, TouchableOpacity, View, Platform } from 'react-native';
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
import RemoveAdsSubscription from './globalScreens/RemoveAdsSubscription';
import User from './globalScreens/User';
import { LogBox } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { createStore } from 'redux';
import CoinScreen from './globalScreens/CoinScreen';
import Purchases from 'react-native-purchases';
import { useState, useEffect } from 'react';

import apiConstant from '../helpers/dataApi/apiConstant';
import { GetAxios } from '../helpers/dataApi/crud';
import { DeviceLanguage, LangApp } from '../components/Language';
import FilterListSc from './globalScreens/FilterList';
import Sureler from './globalScreens/Sureler';
import RuhHaliAyetleri from './globalScreens/RuhHaliAyetleri';
import PushNotificationScreen from './globalScreens/PushNotification';
import BanaOzel from './BanaOzel';
import OzelAlanim from './OzelAlanim';
import { navigationRef, flushPendingNavigation } from '../navigation/navigationRef';

// import { getLocales } from 'expo-localization';

LogBox.ignoreLogs(['Warning']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
let vSay = 0;
let showMesage = false;

const APIKeys = {
  apple: 'appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX',
  google: 'goog_OfndwmvoPjhIPGFfcHLzfGuYPIR',
}

export const infoButton = ({ navigation }) => {
  const [hasSubscription, setHasSubscription] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkSubscription = async () => {
    try {
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: APIKeys.google })
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple })
      }

      const customerInfo = await Purchases.getCustomerInfo()
      const isActive = customerInfo.entitlements.active['naim1016'] !== undefined
      
      setHasSubscription(isActive)
      setLoading(false)
    } catch (error) {
      console.warn('Subscription check error', error)
      setHasSubscription(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSubscription()

    // Navigation focus olduğunda tekrar kontrol et (satın alma sonrası için)
    const unsubscribeFocus = navigation?.addListener('focus', () => {
      checkSubscription()
    })

    return () => {
      if (unsubscribeFocus) {
        unsubscribeFocus()
      }
    }
  }, [navigation])

  if (loading) {
    return null
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      {hasSubscription ? (
        <TouchableOpacity
        delayLongPress={()=>{return true}  }  
          onPress={() => {
            navigation.navigate('RemoveAds')
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 10,
            paddingVertical: 4,
            paddingHorizontal: 10,
          }}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={16}
            color="#2E7D32"
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: '#2E7D32',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 'bold',
            }}
          >
            Reklamsız
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
        delayLongPress={()=>{return true}  }  
          onPress={() => {
            navigation.navigate('RemoveAds')
          }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            marginRight: 10,
            paddingVertical: Platform.OS === 'ios' ? 3 : 6,
            paddingHorizontal: Platform.OS === 'ios' ? 8 : 14,
            borderWidth: Platform.OS === 'ios' ? 1 : 1.5,
            borderColor: '#6A1B9A',
          }}
        >
          <Text
            style={{
              color: '#6A1B9A',
              textAlign: 'center',
              fontSize: Platform.OS === 'ios' ? 10 : 13,
              fontWeight: 'bold', 
            }}
          >
            Reklamsız/Premium
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
const HomeStack = createStackNavigator();
function HomeStackScreen({ setCoin, start }) {

  return (
    <HomeStack.Navigator screenOptions={{ headerBackTitle: LangApp("geri") }}>
      <HomeStack.Screen name="Home" options={(e) => ({ title: LangApp("gd"), headerRight: () => infoButton(e) })} component={Home} />
      <HomeStack.Screen options={(e) => ({ title: e.route.params.name, headerRight: () => infoButton(e) })} name="CategoryDetail" component={Detail} />

      <HomeStack.Screen name="Steps" options={(e) => ({ title: "Dua Adımları", headerRight: () => infoButton(e) })} component={(c) => <Steps {...c} setCoin={setCoin}></Steps>} />
      <SginInStack.Screen name="Coin" options={{ title: LangApp("anahtar") }} component={(c) => <CoinScreen {...c} start={start}></CoinScreen>} />
      <HomeStack.Screen name="RemoveAds" options={{ title: "Reklamı Kaldır" }} component={(c) => <RemoveAdsSubscription {...c} start={alert}></RemoveAdsSubscription>} />
      <HomeStack.Screen name="Info" options={{ title: "Gizli Dualar Nedir" }} component={AboutGizliDualar} />
      <HomeStack.Screen name="RuhHaliAyetleri" options={(e) => ({ title: "Ruh Hali Ayetleri", headerRight: () => infoButton(e) })} component={RuhHaliAyetleri} />

    </HomeStack.Navigator>
  );
}

const FilterListStack = createStackNavigator();
function FilterListStackScreeen({ setCoin }) {

  return (
    <FilterListStack.Navigator screenOptions={{ headerBackTitle: LangApp("geri") }}>
      <FilterListStack.Screen name="FilterList" options={(e) => ({ headerRight: () => infoButton(e), title: "Ruh Hali Ayetleri" })} component={RuhHaliAyetleri} />
      <HomeStack.Screen name="Steps" options={(e) => ({ title: "Dua Adımları", headerRight: () => infoButton(e) })} component={(c) => <Steps {...c} setCoin={setCoin}></Steps>} />

    </FilterListStack.Navigator>
  );
}


const SurelerStack = createStackNavigator();
function SurelerStackScreen({ start }) {
  return (
    <SurelerStack.Navigator screenOptions={{ headerBackTitle: LangApp("geri") }}>
      <SurelerStack.Screen
        name="Sureler"
        options={(e) => ({ headerRight: () => infoButton(e), title: LangApp("sureler") })}
        component={Sureler}
      />
      <SurelerStack.Screen 
        name="RemoveAds" 
        options={{ title: "Reklamı Kaldır" }} 
        component={(c) => <RemoveAdsSubscription {...c} start={start || (() => {})}></RemoveAdsSubscription>} 
      />
    </SurelerStack.Navigator>
  )
}

const OzelAlanimStack = createStackNavigator();
function OzelAlanimStackScreen() {
  return (
    <OzelAlanimStack.Navigator screenOptions={{ headerBackTitle: LangApp("geri") }}>
      <OzelAlanimStack.Screen
        name="OzelAlanim"
        options={(e) => ({ headerRight: () => infoButton(e), title: LangApp("ozelAlanim") })}
        component={OzelAlanim}
      />
    </OzelAlanimStack.Navigator>
  )
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

      <HomeStack.Screen name="RemoveAds" options={{ title: "Reklamı Kaldır" }} component={(c) => <RemoveAdsSubscription {...c} start={start}></RemoveAdsSubscription>} />
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
      <UserStack.Screen 
        name="RemoveAds" 
        options={{ title: "Reklamı Kaldır" }} 
        component={(c) => <RemoveAdsSubscription {...c} start={start || (() => {})}></RemoveAdsSubscription>} 
      />
    </UserStack.Navigator>
  );
}
const CoinStack = createStackNavigator();

function CoinStackStackScreen({ isLogin, setCoin, start }) {

  return (
    <UserStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      <UserStack.Screen name="Profile" options={(e) => ({ title: "Anahtar", headerRight: () => infoButton(e) })} component={(c) => <CoinScreen start={start} {...c} setCoin={setCoin}></CoinScreen>} />
    </UserStack.Navigator>
  );
}

const BanaOzelStack = createStackNavigator();

function BanOzelScreen({ isLogin, setCoin, start }) {

  return (
    <BanaOzelStack.Navigator screenOptions={{ headerBackTitle: "Geri" }}>
      <BanaOzelStack.Screen name="BanaOzel" options={(e) => ({ title: "Anahtar", headerRight: () => infoButton(e) })} component={(c) => <BanaOzel start={start} {...c} setCoin={setCoin}></BanaOzel>} />
    </BanaOzelStack.Navigator>
  );
}


const Tab = createBottomTabNavigator();

export default function Index({ startBase }) {
  const [isLogin, setIsLogin] = React.useState(false)
  const [refresh, setRefresh] = React.useState()

  const [coin, setCoin] = React.useState(0)
  const previousRouteName = React.useRef(null)


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

  // Reklam gösterilmeyecek sayfalar
  const excludedRoutes = ['SignIn', 'RemoveAdsSubscription', 'Coin', 'Profile','HomeStack','Steps','Detail','CategoryDetail',"OzelAlanim","Home","RemoveAds"]

  const handleNavigationStateChange = (state) => {
    if (!state) return

    // Navigation state'den aktif route'u bul
    const getActiveRouteName = (navState) => {
      if (!navState || typeof navState.index !== 'number') {
        return null
      }
      const route = navState.routes[navState.index]
      if (route.state) {
        return getActiveRouteName(route.state)
      }
      return route.name
    }

    const currentRouteName = getActiveRouteName(state)

    // İlk açılışta veya aynı sayfaya tekrar gidildiğinde reklam gösterme
    if (!currentRouteName || currentRouteName === previousRouteName.current) {
      return
    }

    // Belirli sayfalarda reklam gösterme
    if (excludedRoutes.includes(currentRouteName)) {
      previousRouteName.current = currentRouteName
      return
    }

    // Sayfa değişti, reklam tetikle
    previousRouteName.current = currentRouteName
    setTimeout(() => {
      globalThis.__TRIGGER_AD_OVERLAY?.()
    }, 1000) // Kısa bir gecikme ile daha doğal görünsün
  }

  return (
    <Provider store={store}>

      <NavigationContainer 
        ref={navigationRef} 
        onReady={flushPendingNavigation}
        onStateChange={handleNavigationStateChange}
      >
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
                  ? 'book-open-variant'
                  : 'book-open-variant-outline';
              } else if (route.name === 'Sureler') {
                iconName = 'headphones';
              } else if (route.name === 'BanaOzel') {
                iconName = focused
                  ? 'pentagram'
                  : 'pentagram';
              } else if (route.name === 'OzelAlanim') {
                iconName = focused ? 'hands-pray' : 'hands-pray';
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
                  incSize = 42
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
                  incSize = 42
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
                  incSize = 42
                }
              }
              if (route.name === 'Sureler') {
                sty = { backgroundColor: "#AEEA00", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "#FF3D00"
                  sty.width = 60
                  sty.height = 60
                  incSize = 42
                }
              }
              if (route.name === 'BanaOzel') {
                sty = { backgroundColor: "#AEEA00", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "#FF3D00"
                  sty.width = 60
                  sty.height = 60
                  incSize = 42
                }
              }
              if (route.name === 'OzelAlanim') {
                sty = { backgroundColor: "#BBDEFB", width: 48, height: 48, marginTop: 5, borderRadius: 50, justifyContent: "center", alignItems: "center" }
                if (focused) {
                  sty.marginTop = 1
                  sty.borderWidth = 1
                  sty.borderColor = "#1976D2"
                  sty.width = 60
                  sty.height = 60
                  incSize = 42
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
          <Tab.Screen options={{ tabBarLabel: "", title: LangApp("sureler"), headerShown: false }} name="Sureler" component={(c) => <SurelerStackScreen {...c} start={start}></SurelerStackScreen>} />
          <Tab.Screen
            options={{ tabBarLabel: "", title: LangApp("ozelAlanim"), headerShown: false }}
            name="OzelAlanim"
            component={(c) => <OzelAlanimStackScreen {...c}></OzelAlanimStackScreen>}
          />

          <Tab.Screen options={{ tabBarLabel: "", title: "Ruh Hali Ayetleri", headerShown: false }} name="FilterList" component={(c) => <FilterListStackScreeen setCoin={setCoin} {...c}></FilterListStackScreeen>} />
          {/* <Tab.Screen options={{ tabBarLabel: "", title: "Dualar", headerShown: false }} name="BanaOzel" component={(c) => <BanOzelScreen setCoin={setCoin} {...c}></BanOzelScreen>} /> */}

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