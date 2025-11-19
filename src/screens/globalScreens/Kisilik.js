import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View, Keyboard } from 'react-native';
import { LangApp } from '../../components/Language';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import DatePicker from '../../components/DatePicker';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import CheckBox from '@react-native-community/checkbox';
import moment from 'moment';
import carkCalculator from '../../components/carkCalculator';
import PowerProgressCal from '../../components/PowerProgressCal';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { connect } from 'react-redux';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
function Kisilik(props) {
    const [birthDay, setBirthDay] = useState(new Date())
    const [birthHour, setBirthHour] = useState()
    const [cark1, setCark1] = useState(-90)
    const [cark2, setCark2] = useState(-90)
    const [sonuc, setSonuc] = useState()
    const [yorum, setYorum] = useState({})
    const [baseDate, setBaseDate] = useState({
        dogumTarihi: new Date(),
        dogumSaati: undefined,
        erkek: false,
        kadin: false,
        boy: 0,
        anneYas: 0,
        babaYas: 0,

    })
useEffect(()=>{

},[])

    const carkCal = async () => {
        Keyboard.dismiss();

        var tkn = await AsyncStorage.getItem("hlcapptokengDua").then(x => { return x })


        if (!baseDate.dogumSaati) {
            Alert.alert(LangApp("hata"), LangApp("dogumSaatiGir"))
            return false
        }

        if (baseDate.dogumSaati.length < 5) {
            Alert.alert(LangApp("hata"), LangApp("dogumSaatiGir"))
            return false
        }

        var aylar = require("../../../aylar.json")
        var saats = parseInt(baseDate.dogumSaati.split(":")[0]);
        if (saats == 0) {
            saats = 24

        }

        var aylarSonuc = aylar[moment(baseDate.dogumTarihi).format("M")][saats]

        var carkSonuc = carkCalculator(baseDate);
        //    setCark1( carkSonuc.crk1)

        setSonuc(undefined)

        for (let index = -90; index < carkSonuc.crk2 + 1; index++) {

            await new Promise(r => setTimeout(r, 1));
            setCark2(index)
            index = index + 3
        }
        for (let index = -90; index < carkSonuc.crk1 + 1; index++) {

            await new Promise(r => setTimeout(r, 1));
            setCark1(index)
            index = index + 3

        }
        setSonuc(carkSonuc)
        setYorum(aylarSonuc)

        // var endpoint = await apiConstant.BaseUrl + `/api/usermanager/sellCoin/200`
        // var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });






    }



    return (
        <View>
            <View style={{
                backgroundColor: "#EDE7F6",

                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 6,
                },
                shadowOpacity: 0.50,
                shadowRadius: 10,

                elevation: 2,
                paddingBottom: 5,
                borderBottomWidth: 1,
                borderColor: "black"
            }}>

                <LinearGradient start={{ x: 0.45, y: .1 }} style={{ padding: 7, width: "100%" }} colors={['#B2DFDB', 'white']} >
                    <Text style={{ fontWeight: "bold", fontSize: 14, color: "black", textAlign: "center" }}>{LangApp("kisiAnaliz")}</Text>
                </LinearGradient>
                <View style={{ flexDirection: "row", height: 55, marginTop: 10 }}>
                    <View style={{ flex: 1, padding: 10, justifyContent: "center" }}>
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
                            <Text style={{ fontSize: 13 }}>{LangApp("dogumTarihi")}</Text>
                        </View>

                        <View style={{ alignItems: "center" }}>
                            <DatePicker activeDate={baseDate.dogumTarihi} value={baseDate.dogumTarihi} onChange={(e, d) => { setBaseDate((b) => { return { ...b, dogumTarihi: moment(d) } }) }}></DatePicker>

                        </View>

                    </View>
                    <View style={{ flex: 1, padding: 10, justifyContent: "center" }}>
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
                            <Text style={{ fontSize: 13 }}>{LangApp("dogumSaati")}</Text>
                        </View>

                        <View style={{ alignItems: "center", width: 80, justifyContent: "center", flexDirection: "row", alignSelf: "center" }}>
                            <FloatingLabelInput
                                hintTextColor={'#aaa'}
                                value={baseDate.dogumSaati}
                                keyboardType="numeric"

                                type={"number"}
                                inputMode="numeric"
                                mask='99:99'
                                onChangeText={(val) => {
                                    let err = true;
                                    try {
                                        let dd = val.split(":")[0]
                                        if (dd > 24) {
                                            err = true
                                            alert("Saat Hatalı")
                                            setBaseDate((b) => { return { ...b, dogumSaati: "" } })
                                        } else {
                                            err = false
                                        }
                                    } catch (error) {
                                        err = true
                                    }
                                    if (err == false) {
                                        setBaseDate((b) => { return { ...b, dogumSaati: val } })
                                    }
                                }
                                }


                                containerStyles={{

                                    borderWidth: 2,
                                    paddingHorizontal: 5,
                                    backgroundColor: '#fff',
                                    borderColor: 'grey',

                                    height: 36,
                                    marginTop: 0,
                                    borderRadius: 10,



                                }}
                                inputStyles={{
                                    color: 'blue',
                                    paddingHorizontal: 10,
                                }}

                            />

                        </View>

                    </View>

                </View>

                <View style={{ flexDirection: "row", height: 55, marginTop: 10 }}>

                    <View style={{ flex: 1, padding: 10, justifyContent: "center" }}>
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
                            <Text>{LangApp("erkek")}</Text>
                        </View>

                        <View style={{ alignItems: "center", width: 60, justifyContent: "center", flexDirection: "row", alignSelf: "center" }}>
                            <CheckBox
                                disabled={false}

                                value={baseDate.erkek}
                                onValueChange={(newValue) => { Keyboard.dismiss(); setBaseDate((b) => { return { ...b, kadin: false, erkek: true } }) }}
                            />

                        </View>

                    </View>
                    <View style={{ flex: 1, padding: 10, justifyContent: "center" }}>
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
                            <Text>{LangApp("kadin")}</Text>
                        </View>

                        <View style={{ alignItems: "center", width: 60, justifyContent: "center", flexDirection: "row", alignSelf: "center" }}>
                            <CheckBox
                                disabled={false}
                                value={baseDate.kadin}
                                onValueChange={(newValue) => { Keyboard.dismiss(); setBaseDate((b) => { return { ...b, kadin: true, erkek: false } }) }}
                            />

                        </View>

                    </View>

                    <View style={{ flex: 1, padding: 10, justifyContent: "center" }}>
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
                            <Text style={{ fontSize: 11 }}>{LangApp("boy")}</Text>
                        </View>

                        <View style={{ alignItems: "center", width: 60, justifyContent: "center", flexDirection: "row", alignSelf: "center" }}>
                            <FloatingLabelInput
                                hintTextColor={'#aaa'}
                                value={baseDate.boy}
                                keyboardType="numeric"
                                maxLength={33}
                                type={"number"}
                                inputMode="numeric"

                                onChangeText={(val) => { setBaseDate((b) => { return { ...b, boy: val } }) }}

                                containerStyles={{

                                    borderWidth: 2,
                                    paddingHorizontal: 5,
                                    backgroundColor: '#fff',
                                    borderColor: 'grey',

                                    height: 36,
                                    marginTop: 0,
                                    borderRadius: 10,



                                }}
                                inputStyles={{
                                    color: 'blue',
                                    paddingHorizontal: 10,
                                }}

                            />

                        </View>

                    </View>
                    <View style={{ flex: 1, padding: 10, justifyContent: "center" }}>
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
                            <Text style={{ fontSize: 11 }}>{LangApp("anneYas")}</Text>
                        </View>

                        <View style={{ alignItems: "center", width: 60, alignSelf: "center" }}>
                            <FloatingLabelInput
                                hintTextColor={'#aaa'}
                                value={baseDate.anneYas}
                                keyboardType="numeric"
                                maxLength={2}
                                type={"number"}
                                inputMode="numeric"

                                onChangeText={(val) => { setBaseDate((b) => { return { ...b, anneYas: val } }) }}

                                containerStyles={{

                                    borderWidth: 2,
                                    paddingHorizontal: 5,
                                    backgroundColor: '#fff',
                                    borderColor: 'grey',

                                    height: 36,
                                    marginTop: 0,
                                    borderRadius: 10,



                                }}
                                inputStyles={{
                                    color: 'blue',
                                    paddingHorizontal: 10,
                                }}

                            />
                        </View>

                    </View>
                    <View style={{ flex: 1, padding: 10, justifyContent: "center" }}>
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
                            <Text style={{ fontSize: 11 }}>{LangApp("babaYas")}</Text>
                        </View>

                        <View style={{ alignItems: "center", width: 60, justifyContent: "center", flexDirection: "row", alignSelf: "center" }}>
                            <FloatingLabelInput
                                hintTextColor={'#aaa'}
                                value={baseDate.babaYas}
                                keyboardType="numeric"
                                maxLength={2}
                                type={"number"}
                                inputMode="numeric"

                                onChangeText={(val) => { setBaseDate((b) => { return { ...b, babaYas: val } }) }}

                                containerStyles={{

                                    borderWidth: 2,
                                    paddingHorizontal: 5,
                                    backgroundColor: '#fff',
                                    borderColor: 'grey',

                                    height: 36,
                                    marginTop: 0,
                                    borderRadius: 10,



                                }}
                                inputStyles={{
                                    color: 'blue',
                                    paddingHorizontal: 10,
                                }}

                            />

                        </View>

                    </View>

                </View>
                <TouchableOpacity  delayLongPress={()=>{return true}  }  onPress={() => { carkCal() }} style={{
                    width: "98%", backgroundColor: "#B2DFDB", justifyContent: "center", alignItems: "center", height: 40,
                    marginTop: 20,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "#009688",
                    marginLeft: "1%"
                }}>
                    <Text style={{ fontWeight: "bold" }}>{LangApp("hesapla")}</Text>
                </TouchableOpacity>

            </View>
            <ScrollView style={{ marginTop: 20, maxHeight: 400 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 5 }}>
                    <Text style={{ fontSize: 19 }}>طقس</Text>
                    <Text style={{ fontSize: 19 }}>هذا</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                    <Image style={{ resizeMode: "contain", width: 170, height: 170 }} source={require("../../assets/crk1.jpeg")}>

                    </Image>

                    <Image style={{ resizeMode: "contain", width: 170, height: 170 }} source={require("../../assets/crk2.jpeg")}>

                    </Image>

                    <Image style={{
                        resizeMode: "contain", width: 100,
                        height: 100,
                        position: "absolute",
                        top: 35,
                        left: 50,
                        transform: [{ rotate: cark1 + 'deg' }]
                    }} source={require("../../assets/arrowBBB.png")}>


                    </Image>

                    <Image style={{
                        resizeMode: "contain", width: 100,
                        height: 100,
                        position: "absolute",
                        top: 35,
                        right: 50,
                        transform: [{ rotate: cark2 + 'deg' }]
                    }} source={require("../../assets/arrowBBB.png")}>

                    </Image>

                </View>
                {sonuc && <View>

                    <View style={{ padding: 10, flexDirection: "row", marginTop: 20, justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("duygusallik")} :</Text>
                            {sonuc && <PowerProgressCal power={sonuc?.duygusallik}></PowerProgressCal>}

                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("sinir")} :</Text>
                            {sonuc && <PowerProgressCal power={sonuc?.sinirlilik}></PowerProgressCal>}

                        </View>

                    </View>

                    <View style={{ padding: 10, flexDirection: "row", marginTop: 5, justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("irade")} :</Text>
                            {sonuc && <PowerProgressCal power={sonuc?.irade}></PowerProgressCal>}

                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("ego")} :</Text>
                            {sonuc && <PowerProgressCal power={sonuc?.ego}></PowerProgressCal>}

                        </View>

                    </View>
                    <View style={{ padding: 10, flexDirection: "row", marginTop: 5, justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("merhamet")} :</Text>
                            {sonuc && <PowerProgressCal power={sonuc?.merhamet}></PowerProgressCal>}

                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("sorumluluk")} :</Text>
                            {sonuc && <PowerProgressCal power={sonuc?.sorumluluk}></PowerProgressCal>}

                        </View>

                    </View>
                    <View style={{ padding: 10, flexDirection: "row", marginTop: 5, justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("sadakat")} :</Text>
                            {sonuc && <PowerProgressCal power={sonuc?.sadakat}></PowerProgressCal>}

                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ fontSize: 11, marginBottom: -2 }}>{LangApp("saygi")} :</Text>
                            {sonuc && <PowerProgressCal power={(sonuc?.ort).toFixed()}></PowerProgressCal>}

                        </View>

                    </View>

                    <View style={{ padding: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "white", fontSize: 14, backgroundColor: "#673AB7", padding: 5 }}>Duygusal Özellik</Text>
                        <View style={{ backgroundColor: "#D1C4E9", padding: 10, borderWidth: 1, borderStyle: "solid", borderColor: "#673AB7" }}>
                            {yorum?.duygusalOzellik?.map((item, key) => {
                                return <Text style={{ padding: 5 }} key={key}>- {item}</Text>
                            })}
                        </View>
                    </View>

                    <View style={{ padding: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "white", fontSize: 14, backgroundColor: "#D81B60", padding: 5 }}>Kişilik Biglisi</Text>
                        <View style={{ backgroundColor: "#F8BBD0", padding: 10, borderWidth: 1, borderStyle: "solid", borderColor: "#D81B60" }}>
                            {yorum?.kisilikBilgileri?.map((item, key) => {
                                return <Text style={{ padding: 5 }} key={key}>- {item}</Text>
                            })}
                        </View>
                    </View>


                    <View style={{ padding: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "white", fontSize: 14, backgroundColor: "#2E7D32", padding: 5 }}>Güçlü Yönleri</Text>
                        <View style={{ backgroundColor: "#C8E6C9", padding: 10, borderWidth: 1, borderStyle: "solid", borderColor: "#2E7D32" }}>
                            {yorum?.gucluYonleri?.map((item, key) => {
                                return <Text style={{ padding: 5 }} key={key}>- {item}</Text>
                            })}
                        </View>
                    </View>

                    <View style={{ padding: 10 }}>
                        <Text style={{ fontWeight: "bold", color: "white", fontSize: 14, backgroundColor: "#E65100", padding: 5 }}>Zayıf Yönleri</Text>
                        <View style={{ backgroundColor: "#FBE9E7", padding: 10, borderWidth: 1, borderStyle: "solid", borderColor: "#E65100" }}>
                            {yorum?.zayifYonleri?.map((item, key) => {
                                return <Text style={{ padding: 5 }} key={key}>- {item}</Text>
                            })}
                        </View>
                    </View>
                </View>}

            </ScrollView>
            {/* <AdContainer
       
                adUnitID="ca-app-pub-8795169628743262/4035679782" // Reklam birim kimliğinizi buraya girin
             

                adSize="BANNER"
                testDevices={[AdManager.simulatorId]} // Test cihazları
                onAdFailedToLoad={(error) => console.error('Reklam yüklenirken bir hata oluştu:', error)}
        
            /> */}

        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        UserData: state
    }
}
const mapDispatchToProps = (dispatch) => {
    console.log("dispatch")
    return {

        changeUser: (data) => dispatch({ type: "UserData", payload: data })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Kisilik);