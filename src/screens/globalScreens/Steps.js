import StepIndicator from 'react-native-step-indicator';
import React, { useEffect, useState } from 'react';
import { GetAxios, PostAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MaterialCommunityIcons
    from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dialog } from 'react-native-paper';
import Sozluk from '../../components/Sozluk';
import { DeviceLanguage, LangApp } from '../../components/Language';
import Purchases from 'react-native-purchases';

const customStyles = {
    stepIndicatorSize: 25,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#fe7013',
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: '#fe7013',
    stepStrokeUnFinishedColor: '#aaaaaa',
    separatorFinishedColor: '#fe7013',
    separatorUnFinishedColor: '#aaaaaa',
    stepIndicatorFinishedColor: '#fe7013',
    stepIndicatorUnFinishedColor: '#ffffff',
    stepIndicatorCurrentColor: '#ffffff',
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: '#fe7013',
    stepIndicatorLabelFinishedColor: '#ffffff',
    stepIndicatorLabelUnFinishedColor: '#aaaaaa',
    labelColor: '#999999',
    labelSize: 13,
    currentStepLabelColor: '#fe7013'
}

const APIKeys = {
    apple: "appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX",
    google: "goog_OfndwmvoPjhIPGFfcHLzfGuYPIR",
};

const Steps = (props) => {
    const [currentPosition, setCurrentPosition] = useState(1)
    const [labels, setLabels] = useState([""])
    const [stepLenght, setStepLength] = useState(1)
    const [stepContents, setStepContents] = useState([])
    const [selectedStep, setSelectedStep] = useState({})
    const [hiddenPage, setHiddenPage] = useState(false)
    const [onlyOnePageAndCoin, setOnlyOnePageAndCoin] = useState(false)
    const [alertDialog, setAlertDialog] = useState(false)
    const [isLockDua, setIsLockDua] = useState(false)
    const [loading, setLoading] = useState(false)
    const [coinSucces, setCoinSuccess] = useState(false)
    const [loadingCoindSucces, setLoadinCoinSuccess] = useState(false)
    const [sozluk, setSozluk] = useState([])
    const [duaCoin, setDuaCoin] = useState({})
    const [resizeGif, setResizeGif] = useState(false)
    const [token, setToken] = useState()

  
    const [packages, setPackages] = useState([]);


    // props.navigation.navigate("SignIn")
    props.navigation.setOptions({ title: LangApp("duaUygulanis") })
    const [selectedSozluk, setSelectedSozluk] = useState({})
    const [alertDialog2, setAlertDialog2] = useState(false)

    const openSozluk = (data) => {
        setSelectedSozluk(data)
        setAlertDialog2(true)
    }
    useEffect(() => { start() }, [])
    const DuaKilitAc = async () => {
        setLoading(true)
        var token = await AsyncStorage.getItem("hlcapptokengDua")

        if (token == null) {

            props.navigation.navigate("Coin")
            setLoading(false)
            return false;
        }
        var endpoint = await apiConstant.BaseUrl + "/api/dualar/DuaKilitAc"
        var rps = await PostAxios(endpoint, { duaId: props.route.params.item.id }).then(x => { return x.data }).catch(x => { return x });

        if (rps.isError) {
            if (rps.message == "coin") {
                setAlertDialog(true)
                setLoading(false)
            }
        } else {


            setLoadinCoinSuccess(true);
            setTimeout(() => {
                setLoadinCoinSuccess(false);
                setCoinSuccess(true);

                setTimeout(async () => {

                    setCoinSuccess(false);
                    var endpoint2 = await apiConstant.BaseUrl + `/api/usermanager/GetCurrentMobilUser`
                    var rps2 = await GetAxios(endpoint2).then(x => { return x.data }).catch(x => { return x });

                    props.setCoin(rps2.data.coin)
                    props.changeUser({ UserData: rps2.data })
                }, 3100);

            }, 2100);


            setLoading(false)
            setHiddenPage(false)
            setCurrentPosition(0)
            start();




        }



    }





    const start = async () => {


        var token = await AsyncStorage.getItem("hlcapptokengDua")
        setToken(token)

        var endpoint = await apiConstant.BaseUrl + "/api/dualar/GetSteps"
        var rps = await PostAxios(endpoint, { duaId: props.route.params.item.id }).then(x => { return x.data }).catch(x => { return x });
        setResizeGif(true)
        let vrLabel = []

        setStepLength(rps.data.stepCount)
        setSozluk(rps.data.sozluk)
        setDuaCoin(rps.data.coin)

        if (rps.data.onlyOneStepAndLock == true) {
            setOnlyOnePageAndCoin(true)
            setHiddenPage(true)
            return false
        }

        for (let index = 0; index < rps.data.stepCount; index++) {
            if (index + 1 > rps.data.steps.length) {
                vrLabel.push(<MaterialCommunityIcons
                    name={"lock"}
                    size={19}
                    color={"grey"}
                />)
            } else {
                vrLabel.push(LangApp("adim"))
            }

        }

        setIsLockDua(rps.data.lock)
        setStepContents(rps.data.steps)
        setSelectedStep(rps.data.steps.find(x => { return x.sira == 1 }))
        setLabels(vrLabel)
        setTimeout(() => {
            setResizeGif(false)
        }, 3000);

      
        const setup = async () => {
            // alert("fds")
            if (Platform.OS == "android") {
    
                await Purchases.configure({ apiKey: APIKeys.google });
            }
    
            else {
                await Purchases.configure({ apiKey: APIKeys.apple });
            }
    
            const offerings = await Purchases.getOfferings()
    
            setLoading(false) 
            setPackages(offerings.current.availablePackages.find(x=> {return x.identifier==rps.data.coin}));
            
            //   rps.data.coin 
            Purchases.setDebugLogsEnabled(true)
        };
 
 
        setup()
            .catch("EEEEEER",console.log);

    }


    const setPurchasesPackage = async (p) => {
      
        
        try {
            await Purchases.purchasePackage(p)
            var endpoint = await apiConstant.BaseUrl + "/api/dualar/DuaKilitAcPrice"
            var rps = await PostAxios(endpoint, { duaId: props.route.params.item.id }).then(x => { return x.data }).catch(x => { return x });
            alert("İşlem Başarılı... Kilit Açıldı")

         
  
            // var prpData = props.UserData

         
            setLoadinCoinSuccess(true);
            setTimeout(() => {
                setLoadinCoinSuccess(false);
                setCoinSuccess(true);

                setTimeout(async () => {

                    setCoinSuccess(false);
                    var endpoint2 = await apiConstant.BaseUrl + `/api/usermanager/GetCurrentMobilUser`
                    var rps2 = await GetAxios(endpoint2).then(x => { return x.data }).catch(x => { return x });

                    // props.setCoin(rps2.data.coin)
                    props.changeUser({ UserData: rps2.data })
                }, 3100);

            }, 2100);
  

            setLoading(false)
            setHiddenPage(false)
            setCurrentPosition(0)
            start();
            // start()
        } catch (error) {
            alert("Satınalma Başarısız")
        }

    }

   
    const stepChange = (val) => {
        let data = stepContents.find(x => { return x.sira == currentPosition + val })

        if (data) {
            setHiddenPage(false)
            setSelectedStep(data)
            setCurrentPosition(currentPosition + val)
        } else {
            if (isLockDua) {
                if (val > 0) {

                    setHiddenPage(true)
                    if (!hiddenPage) {
                        setCurrentPosition(currentPosition + val)
                    }

                } else {
                    setCurrentPosition(1)

                }
            }

        }

    }
    if (!loading) {


        return (
            <View style={{ flex: 1, paddingTop: 15 }}>
                {stepLenght > 1 && <StepIndicator
                    customStyles={customStyles}
                    currentPosition={currentPosition}
                    labels={labels}
                    stepCount={stepLenght}


                />}
                {!hiddenPage && <View style={{ flex: 6 }}>
                    {stepLenght > 1 && <View style={{ paddingLeft: 15, marginTop: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "#fe7013", fontSize: 25 }}>      {selectedStep.sira}. {LangApp("adim")}</Text>
                    </View>}
                    {stepLenght == 1 && <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "#fe7013", fontSize: 15, textAlign: "center" }}>      {selectedStep.title}</Text>
                    </View>}

                    <View style={{ padding: 15, marginBottom: 5 }}>

                        {/* <Text style={{ fontWeight: "bold", fontSize: 15 }}>     </Text> */}
                        {/* {Sozluk(sozluk,selectedStep.icerik)}  */}
                        {/* <Sozluk  sozluk={sozluk} icerik={selectedStep.icerik}></Sozluk> */}

                        <View>

                            <View>
                                <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                                    {DeviceLanguage == "ar" ? selectedStep.icerikArabic : selectedStep.icerik}
                                </Text>
                            </View>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                                {sozluk?.map((item, key) => {
                                    return (<Text
                                        onPress={() => openSozluk(item)}
                                        style={{
                                            padding: 2,
                                            backgroundColor: "orange",
                                            color: "white",
                                            fontSize: 10,
                                            marginRight: 5,
                                            borderRadius: 10
                                        }}>{item.key} ? </Text>)
                                })}


                            </View>

                        </View>

                    </View>
                    <ReactNativeZoomableView
                        maxZoom={1.5}
                        minZoom={1}
                        zoomStep={0.5}
                        initialZoom={1}
                        bindToBorders={true}

                        style={{
                            padding: 1,
                            backgroundColor: 'white',
                        }}
                    >
                        <Image style={{ resizeMode: "contain", height: "100%" }} source={{ uri: apiConstant.IMAGEBASEURL + "/" + selectedStep.imageUrl }}></Image>
                    </ReactNativeZoomableView>
                    {resizeGif && <Image style={{ position: "absolute", width: 150, height: 150, bottom: 50, right: 50 }} source={require("../../assets/resize.gif")}></Image>
                    }
                </View>}

                {hiddenPage && <View style={{ flex: 6, justifyContent: "center", alignItems: "center" }}>
                    <MaterialCommunityIcons
                        name={"lock"}
                        size={90}
                        color={"red"}
                    />
                    <Text style={{ color: "red", fontSize: 25 }}>{LangApp("badimk")}</Text>
                    <View style={{ backgroundColor: "red", width: 100, justifyContent: "center" }}>

                        <Text style={{ textAlign: "center" }}>
                            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>{packages?.product.priceString} </Text>
                            {/* <MaterialCommunityIcons
                                name={"key"}
                                size={24}
                                color={"white"}
                            /> */}

                        </Text>
                    </View>

                    {token && <TouchableOpacity onPress={
                        // DuaKilitAc
                        ()=>setPurchasesPackage(packages)
                        } style={{ flexDirection: "row", padding: 10, marginTop: 20, backgroundColor: "#a8cea9", borderColor: "#4CAF50", borderWidth: 1, borderStyle: "solid" }}>
                        <MaterialCommunityIcons
                            name={"lock-open"}
                            size={20}
                            color={"green"}
                        /><Text style={{ fontSize: 18, color: "green" }}> {LangApp("kilkaldok")}</Text>
                    </TouchableOpacity>}
                    {!token && <TouchableOpacity  delayLongPress={()=>{return true}  }   onPress={() => props.navigation.navigate("SignIn")} style={{ flexDirection: "row", padding: 10, marginTop: 20, backgroundColor: "#a8cea9", borderColor: "#4CAF50", borderWidth: 1, borderStyle: "solid" }}>
                        <MaterialCommunityIcons
                            name={"lock-open"}
                            size={20}
                            color={"green"}
                        /><Text style={{ fontSize: 18, color: "green" }}> {LangApp("girisYap")}</Text>
                    </TouchableOpacity>}
                    {
                        !token &&
                        <Text style={{ color: "blue", marginTop: 10 }}>{LangApp("besyuzKoin")}</Text>
                    }


                </View>}
   

                {stepLenght > 1 && <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fbe0cf" }}>
                    <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => stepChange(-1)} style={{ justifyContent: "center", flexDirection: "column", height: 60, borderTopRightRadius: 50, alignItems: "center", backgroundColor: "#fe7013", flex: 3 }} >
                        <Text>
                            <MaterialCommunityIcons
                                name={"arrow-left-circle"}
                                size={30}
                                color={"white"}
                            /> </Text>
                        <Text style={{ color: "white" }}>{LangApp("oncekiAdim")}</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 2, flexDirection: "column" }}>
                        <View style={{ borderRadius: 50, width: 50, height: 50, flexDirection: "column", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
                            <Text style={{ fontWeight: "bold", color: "white" }}>{currentPosition}</Text>
                        </View>
                    </View>
                    <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => stepChange(+1)} style={{ justifyContent: "center", height: 60, flexDirection: "column", borderTopLeftRadius: 50, alignItems: "center", backgroundColor: "#fe7013", flex: 3 }} >
                        <Text>
                            <MaterialCommunityIcons
                                name={"arrow-right-circle"}
                                size={30}
                                color={"white"}
                            /> </Text>
                        <Text style={{ color: "white" }}>{LangApp("sonrakiAdim")}</Text>
                    </TouchableOpacity>
                </View>}


                <Dialog visible={alertDialog} onDismiss={() => setAlertDialog(false)} >
                    <Dialog.Content>
                        <View>
                            <Text style={{ fontWeight: "bold", fontSize: 18, color: "red" }}>{LangApp("kilitAcilmadi")}</Text>
                            <Text style={{ fontWeight: "bold", fontSize: 15, color: "black", marginTop: 15 }}>{LangApp("anahtarYetersiz")}



                            </Text>

                            <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 30, paddingBottom: 5 }}>
                                <TouchableOpacity  delayLongPress={()=>{return true}  }  nPress={() => { setAlertDialog(false); props.navigation.navigate('Coin') }} style={{ backgroundColor: "green", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>{LangApp("anahtarAl")}</Text></TouchableOpacity>
                                <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => setAlertDialog(false)} style={{ backgroundColor: "red", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>{LangApp("vazgec")}</Text></TouchableOpacity>
                            </View>
                        </View>

                    </Dialog.Content>
                </Dialog>

                <Dialog visible={alertDialog2} onDismiss={() => setAlertDialog2(false)} >
                    <Dialog.Content>
                        <View>
                            <Text style={{ fontWeight: "bold", fontSize: 18, color: "red" }}>{selectedSozluk.key}</Text>
                            <Text style={{ fontWeight: "bold", fontSize: 15, color: "black", marginTop: 15 }}>{selectedSozluk.description} </Text>

                            <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 30, paddingBottom: 5 }}>
                                <TouchableOpacity onPress={() => setAlertDialog2(false)} style={{ backgroundColor: "green", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Ok</Text></TouchableOpacity>
                                {/* <TouchableOpacity onPress={() => setPasswordDialog(false)} style={{ backgroundColor: "red", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Vazgeç</Text></TouchableOpacity> */}

                            </View>
                        </View>

                    </Dialog.Content>
                </Dialog>
                {coinSucces && <Image style={{ position: "absolute", width: "100%" }} source={require("../../assets/successgif.gif")}></Image>
                }

                {loadingCoindSucces && <View style={{ width: "100%", height: "110%", backgroundColor: "white", position: "absolute" }}>
                    <Image style={{ resizeMode: "contain", position: "absolute", width: 100, alignSelf: "center" }} source={require("../../assets/loading.gif")}></Image>
                </View>
                }
            </View>


        )
    }
}
const mapStateToProps = (state) => {
    return {
        UserData: state
    }
}
const mapDispatchToProps = (dispatch) => {

    return {

        changeUser: (data) => dispatch({ type: "UserData", payload: data })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Steps);