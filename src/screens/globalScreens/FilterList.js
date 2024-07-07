import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Dimensions, Image, Platform, TouchableOpacity } from 'react-native';
import { View, Text, ScrollView } from 'react-native';
import Background from '../../components/Background';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud';
import MaterialCommunityIcons
    from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../../components/Loading';
import PowerProgress from '../../components/PowerProgress';
import { DeviceLanguage, LangApp } from '../../components/Language';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import Purchases from 'react-native-purchases';
function FilterListSc(props) {

    const [dua, setDua] = useState([])
    const [pageOk, setPageOk] = useState(false)
    const [page, setPage] = useState(1)
    const [refresh, setRefresh] = useState(new Date())
    const [loadinData, setLoadinData] = useState(false)
    const [unlockedDua, setUnlockedDua] = useState([])
    const [searchKey, setSearchKey] = useState()
    const [loading, setLoading] = useState(true)
    const [packages, setPackages] = useState([]);

    const APIKeys = {
        apple: "appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX",
        google: "goog_OfndwmvoPjhIPGFfcHLzfGuYPIR",
    };
    // console.log(props.route.params.item)

    // if (DeviceLanguage == "ar") {
    //     props.navigation.setOptions({ title: props.route.params.item.nameArabic })
    // } else {
    //     props.navigation.setOptions({ title: props.route.params.item.name })
    // }

    useEffect(() => { getCategory(page); }, [props])

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    useEffect(() => {


        const setup = async () => {
            // alert("fds")
            if (Platform.OS == "android") {

                await Purchases.configure({ apiKey: APIKeys.google });
            }

            else {
                await Purchases.configure({ apiKey: APIKeys.apple });
            }

            const offerings = await Purchases.getOfferings()

            // setLoading(false) 
            setPackages(offerings.current.availablePackages);

            //   rps.data.coin 
            Purchases.setDebugLogsEnabled(true)
        };


        setup()
            .catch("EEEEEER", console.log);

    }, [])

    const getCategory = async (p, isSearch = false, reset = false) => {


        var duadd = await apiConstant.BaseUrl + `/api/usermanager/getcurrentunlockeddua/`
        var duaRsp = await GetAxios(duadd).then(x => { return x.data }).catch(x => { return x });
        setUnlockedDua(duaRsp.data)
        setLoadinData(true)
        var endpoint = await apiConstant.BaseUrl + "/api/dualar/GetAllMobilFilter/"
        var ssKey = searchKey;
        if (reset === true) {

            ssKey = " "
            setSearchKey(undefined)
        }

        var rps = await PostAxiosAnonym(endpoint, { key: ssKey || " ", pageSize: 10, pageNumber: p }).then(x => { return x.data }).catch(x => { return x });


        if (rps.data.totalCount / 2 > 1) {


            if (rps.data.pageNumber == (rps.data.totalCount / 2).toFixed(0)) {
                setPageOk(true)
                setLoadinData(false)
                return false
            }
        }
        setPage(p)
        var rd = dua
        if (isSearch) {
            rd = []
        }
        for (const iterator of rps.data.list) {
            rd.push(iterator)
        }
        setDua(rd)
        setRefresh(new Date())
        setLoadinData(false)
        setLoading(false)
    }

    return (
        <Background>
            <View style={{
                justifyContent: "center", alignItems: "center", backgroundColor: "#E8EAF6", paddingBottom: 15, paddingTop: 10,
                borderBottomColor: "#7986CB",
                borderBottomWidth: 1,
                borderStyle: "solid",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 6,
                },
                shadowOpacity: 0.90,
                shadowRadius: 4,

                elevation: 2
            }}>
                <View>
                    <Text style={{ fontWeight: "bold", color: "blue" }}>Bulmak istediğiniz duayı aratın</Text>
                </View>

                <View style={{ flexDirection: "row", width: "100%", paddingLeft: 20, paddingRight: 30 }}>

                    <View style={{ height: 70, flexDirection: "row", flex: 4 }}>

                        <FloatingLabelInput
                            label={LangApp("phsearch")}

                            hintTextColor={'#aaa'}

                            value={searchKey}

                            onChangeText={(val) => { ; setSearchKey(val) }}

                            containerStyles={{

                                borderWidth: 2,
                                paddingHorizontal: 5,
                                backgroundColor: '#fff',
                                borderColor: 'blue',

                                height: 50,
                                marginTop: 10,
                                paddingToBottom: 25

                            }}
                            inputStyles={{
                                color: 'blue',
                                paddingHorizontal: 10,
                            }}

                        />

                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={() => { getCategory(1, true) }} style={{
                            borderWidth: 1, borderColor: "#fe7013", borderStyle: "solid", width: 70, height: 50,
                            alignItems: "center",
                            flexDirection: "row", justifyContent: "center", alignSelf: "center", marginTop: 10, padding: 10,
                            borderRadius: 5,
                            backgroundColor: "wihite"
                        }}>
                            <MaterialCommunityIcons name={"magnify"}
                                size={18}
                                color={"#fe7013"}
                            />
                            <Text style={{ color: "#fe7013", fontWeight: "bold" }}>{LangApp("ara")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: "row", flex: 1 }}>


                {refresh > 0 && <ScrollView style={{ width: "100%" }}
                    onScroll={({ nativeEvent }) => {
                        if (isCloseToBottom(nativeEvent)) {

                            getCategory(page + 1)

                        }
                    }}
                >
                    {dua.length == 0 && !loading && <View style={{
                        backgroundColor: "#FCE4EC",
                        padding: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 50,
                        borderStyle: "solid",
                        borderColor: "#EC407A",
                        borderWidth: 1
                    }}>
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: 20, fontWeight: "bold" }}>{LangApp("kayitBulunamadi")}</Text>
                            <Text style={{ fontSize: 16, textAlign: "center", marginTop: 10 }}>{LangApp("cumleBulunamadi")}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { getCategory(1, true, true) }}

                            style={{ borderRadius: 5, padding: 15, backgroundColor: "#A5D6A7", marginTop: 20 }}>
                            <Text>{LangApp("aramaTemizle")}</Text>
                        </TouchableOpacity>

                    </View>}

                    {loading &&
                        <View style={{ justifyContent: "center", alignSelf: "center", marginTop: 10 }}>
                            <Loading width={50} ></Loading>
                        </View>
                    }
                    {dua.map((item, key) => {
                        //  console.log(item.imageUrl)
                        let isUnlocked = unlockedDua?.find(x => { return x == item.id })

                        return <TouchableOpacity key={key} style={{
                            flexDirection: "row",
                            width: "97%",
                            height: 130,
                            alignItems: "center",
                            backgroundColor: "#F3E5F5",
                            borderWidth: 1,
                            borderColor: "#9C27B0",
                            borderStyle: "solid",
                            paddingBottom: 10,
                            paddingTop: 10,
                            borderRadius: 10,
                            alignSelf: "center",
                            marginTop: 25,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 5,
                            },
                            shadowOpacity: 0.49,
                            shadowRadius: 6.27,

                            elevation: 12,
                        }} onPress={() => { props.navigation.navigate("Steps", { item }) }}>
                            <View style={{ flex: 3 }}>
                                <Image style={{ resizeMode: "contain", width: "100%", height: "100%" }} source={{ uri: apiConstant.IMAGEBASEURL + "/" + item.imageUrl }}></Image>




                            </View>
                            {item.coin > 0 && !isUnlocked && <View style={{
                                position: "absolute", zIndex: 999,
                                borderColor: "red",
                                borderStyle: "dotted",
                                backgroundColor: "orange",
                                borderWidth: 1,
                                top: 2,
                                padding: 2,
                                borderRadius: 8,
                                right: 2
                            }}>
                                <Text style={{ fontSize: 13 }}>
                                    {/* {"  "}<MaterialCommunityIcons

                                    name={"key"}
                                    size={14}
                                    color={"white"}
                                /> */}
                                    <Text style={{ color: "white" }}>

                                        {packages.find(x => { return x.identifier == item.coin })?.product.priceString
                                        }
                                    </Text>
                                </Text>

                            </View>}
                            {isUnlocked && <View style={{
                                position: "absolute", zIndex: 999,
                                backgroundColor: "#126f2c",
                                top: 2,
                                padding: 2,
                                borderRadius: 8,
                                right: 2
                            }}>
                                <Text style={{ fontSize: 14 }}>
                                    {"  "}<MaterialCommunityIcons

                                        name={"lock-check"}
                                        size={16}
                                        color={"white"}
                                    />

                                    <Text style={{ color: "white" }}> {LangApp("acildi")}   </Text>
                                </Text>

                            </View>}
                            <View style={{ flex: 6 }}>

                                <View style={{ justifyContent: "center", flexDirection: "row", marginTop: 15 }}>


                                    {DeviceLanguage == "ar" && <Text style={{ fontWeight: "bold", fontSize: 15, textAlign: "center" }}>{item.titleArabic}</Text> || <Text style={{ fontWeight: "bold", fontSize: 15, textAlign: "center" }}>{item.title}</Text>}


                                </View>
                                <View >
                                    {DeviceLanguage == "ar" && <Text style={{ fontSize: 13 }}>{item.descriptionArabic}... </Text> || <Text style={{ fontSize: 13 }}>{item.description}... </Text>}


                                    <Text style={{ fontWeight: "bold", color: "#338199" }}>{LangApp("devami")} ---{">"}</Text>
                                </View>

                            </View>

                            {/* <View style={{
                                justifyContent: "center",
                                position: "absolute", zIndex: 999,
                                backgroundColor: "white",
                                bottom: 2,
                                padding: 7,
                                borderColor: "green",
                                borderWidth: 1,
                                borderStyle: "dotted",
                                right: 2,
                                borderRadius: 8,
                                height: 27,
                                width: 108,
                                paddingRight: 5,
                                marginLeft: 10,

                            }}>
                                <PowerProgress power={item.power}></PowerProgress>
                            </View> */}
                        </TouchableOpacity>
                    })}
                    <View>

                    </View>
                </ScrollView>}
                {loadinData && <View style={{ paddingBottom: 25, paddingTop: 15, backgroundColor: "white", width: Dimensions.get("screen").width, bottom: 1, position: "absolute", flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                    <Loading></Loading>
                </View>}
            </View>
        </Background>
    );
}

export default FilterListSc;