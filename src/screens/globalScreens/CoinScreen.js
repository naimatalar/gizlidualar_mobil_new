import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';
import Background from '../../components/Background';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import MaterialCommunityIcons
    from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Purchases from 'react-native-purchases';



function CoinScreen(props) {

    const APIKeys = {
        apple: "appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX",
        google: "goog_OfndwmvoPjhIPGFfcHLzfGuYPIR",
    };
    const [userData, setUSerData] = useState(props.UserData?.data || {})
    const [coinData, setCoinData] = useState([])
    const [packages, setPackages] = useState([]);
    const [showTest, setShowTest] = useState(false);
    const [showTestCount, setShowTestCount] = useState(0);
      
    useEffect(() => {

        const setup = async () => {
            if (Platform.OS == "android") {

                await Purchases.configure({ apiKey: APIKeys.google });
            } 

            else {  
              await Purchases.configure({ apiKey: APIKeys.apple });
            } 

            const offerings = await Purchases.getOfferings()
            // console.log("ddddd", "offerings")

            // console.log("ddddd", offerings.current.availablePackages)
            setPackages(offerings.current.availablePackages);

            Purchases.setDebugLogsEnabled(true)
        };



        setup()
            .catch(console.log); 
    }, []);

    const setPurchasesPackage = async (p) => {
       
        await Purchases.purchasePackage(p)
     

        var endpoint = await apiConstant.BaseUrl + `/api/usermanager/addcoin/`+p.identifier
        var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        alert("Satınalma Başarılı Toplam"+ rps.data.totalCoin+" Adet Anahtarın Var")
        var prpData=props.UserData
        prpData.data.coin=rps.data.totalCoin;
        props.changeUser({ UserData: prpData })
        props.setCoin(rps.data.totalCoin)
        start()
    }

    useEffect(() => {
        start()


    }, [props.UserData?.data])

    const start = async () => {
        var endpoint = await apiConstant.BaseUrl + `/api/usermanager/GetCurrentMobilUser`
        var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        if (rps.data) {
            setUSerData(rps.data)
            if (!props.UserData?.data) {
                props.changeUser({ UserData: rps.data })
            }

        }
        var endpoint2 = await apiConstant.BaseUrl + `/api/CoinAction/GetAllCoinPriceMobil`
        var d = await GetAxios(endpoint2).then(x => { return x.data }).catch(x => { return x });

        if (d.isError) {
            alert(d.message)
        } else {
            setCoinData(d.data)
        }


    }
    return (
        <Background>
            <View style={{ flex: 1, width: "100%" }}>


                <View style={{
                    flex: 1,
                    borderColor: "#7bacba",
                    borderStyle: "dotted",
                    borderWidth: 1,
                    justifyContent: "center",
                    width: "98%",
                    alignSelf: "center",
                    borderRadius: 10,
                    backgroundColor: "#d6eff6"
                }}>
                    <Text style={{ fontSize: 20, textAlign: "center" }}>
                        Toplam <Text style={{fontWeight:"bold",color:"red"}}>{userData.coin}</Text> anahtarın bulunuyor
                    </Text>
                    <Text style={{ fontSize: 15, textAlign: "center" }}>
                        Anahtarları dikkatli kullan. İhtiyacın olmayan duayı açma.
                    </Text>
                    <Text style={{ fontSize: 17, textAlign: "center", color: "red", fontWeight: "bold" }} onPress={() => {
                        if (showTestCount > 30) {
                            setShowTest(true)
                            setShowTestCount(0)
                            setTimeout(() => {
                                setShowTest(false)
                            }, 3000);
                        }
                        setShowTestCount(showTestCount + 1)
                    }} >
                        İsrafın platformu yoktur İsraf israftır.
                    </Text>
                </View>
                <View style={{ flex: 4 ,marginBottom:10}}>
                    {
                        packages.map((item, key) => {
                            if (item.identifier == "tt1" && showTest == false) {
                                return <View></View>
                            } else if (item.identifier == "tt1" && showTest == true) {
                                return <TouchableOpacity onPress={() => setPurchasesPackage(item)}  style={{ marginBottom: 50 }}>
                                    <Text>G {item.product.price}</Text>
                                </TouchableOpacity>
                            }
                            let colr = ""
                            let borderc=""
                            switch (key) {
                                case 0:
                                    colr = "#BBDEFB"
                                    borderc="blue"
                                    break;
                                case 1:
                                    colr = "#F0F4C3";
                                    borderc="#F9A825"
                                    break;
                                    case 2:
                                        colr = "#E1BEE7"
                                        borderc="red"
                                        break;
                                default:
                                    break;
                            }

                            return <View key={key} style={{ flex: 1, padding: 10   }}>
                                <View style={{ backgroundColor: colr, flex: 1,justifyContent: "center",borderRadius: 10 ,
                            borderWidth:1,borderStyle:"solid",borderColor:borderc
                            }}>
                                    <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                                        <MaterialCommunityIcons

                                            name={"key"}
                                            size={35}
                                            color={"#cc0000"}
                                        />
                                        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#cc0000" }}> {item.identifier} ADET  </Text>
                                        <Text style={{ fontSize: 18, fontWeight: "bold" }}> Dua Açma Anahtarı</Text>

                                    </View>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#043c3f" }}>
                                            {item.product.price.toFixed(2)} ₺
                                        </Text>
                                    </View>

                                    {/* <View style={{ alignItems: "center" }}>
                                        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#005509" }}>
                                         
                                        </Text>
                                    </View> */}

                                    <View style={{ marginBottom: 10, marginTop: 10, alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                                        <TouchableOpacity onPress={() => setPurchasesPackage(item)} style={{ backgroundColor: "#660159", width: 200, padding: 5 }}>
                                            <Text style={{ textAlign: "center", fontWeight: "bold", color: "white", fontSize: 20 }}>Hemen Al !</Text>
                                        </TouchableOpacity>

                                    </View>

                                </View>
                            </View> 
                        })
                    }

                </View>
            </View>
        </Background>
    );
}

const mapStateToProps = (state) => {
    return {
        UserData: state
    }
}
const mapDispatchToProps = (dispatch) => {
    // console.log("dispatch")
    return {

        changeUser: (data) => dispatch({ type: "UserData", payload: data })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(CoinScreen);