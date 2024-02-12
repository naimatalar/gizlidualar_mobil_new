import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Dimensions, Image, TouchableOpacity } from 'react-native';
import { View, Text, ScrollView } from 'react-native';
import Background from '../../components/Background';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios, PostAxiosAnonym } from '../../helpers/dataApi/crud';
import MaterialCommunityIcons
    from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../../components/Loading';
function Detail(props) {

    const [dua, setDua] = useState([])
    const [pageOk, setPageOk] = useState(false)
    const [page, setPage] = useState(1)
    const [refresh, setRefresh] = useState(new Date())
    const [loadinData, setLoadinData] = useState(false)
    const [unlockedDua, setUnlockedDua] = useState([])

    // console.log(props.route.params.item)

    props.navigation.setOptions({ title: props.route.params.item.name })
    useEffect(() => { getCategory(page); }, [props])

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    const getCategory = async (p) => {

        var duadd = await apiConstant.BaseUrl + `/api/usermanager/getcurrentunlockeddua/`
        var duaRsp = await GetAxios(duadd).then(x => { return x.data }).catch(x => { return x });
        setUnlockedDua(duaRsp.data)
        setLoadinData(true)
        var endpoint = await apiConstant.BaseUrl + "/api/dualar/GetAllMobil/"

        var rps = await PostAxiosAnonym(endpoint, { categoryId: props.route.params.item.id, pageSize: 10, pageNumber: p }).then(x => { return x.data }).catch(x => { return x });


        if (rps.data.totalCount / 2 > 1) {


            if (rps.data.pageNumber == (rps.data.totalCount / 2).toFixed(0)) {
                setPageOk(true)
                setLoadinData(false)
                return false
            }
        }
        setPage(p)
        var rd = dua
        for (const iterator of rps.data.list) {
            rd.push(iterator)
        }
        setDua(rd)
        setRefresh(new Date())
        setLoadinData(false)
    }

    return (
        <Background>
            {refresh > 0 && <ScrollView style={{ width: "100%" }}
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {

                        getCategory(page + 1)

                    }
                }}
            >
                {dua.map((item, key) => {
    //  console.log(item.imageUrl)
                    let isUnlocked = unlockedDua?.find(x => { return x == item.id })

                    return <TouchableOpacity key={key} style={{
                        flexDirection: "row",
                        width: "97%",
                        height: 130,
                        alignItems: "center",
                        backgroundColor: "#EDE7F6",
                        borderWidth: 1,
                        borderColor: "#9C27B0",
                        borderStyle: "dashed",
                        paddingBottom: 10,
                        paddingTop: 10,
                        borderRadius: 10,
                        alignSelf: "center",
                        marginTop: 15
                    }} onPress={() => { props.navigation.navigate("Steps", { item }) }}>
                        <View style={{ flex: 3 }}>
                            <Image style={{ resizeMode: "contain", width: "100%", height: "100%" }} source={{ uri: apiConstant.IMAGEBASEURL + "/" + item.imageUrl }}></Image>
                            {item.coin > 0 && !isUnlocked && <View style={{
                                position: "absolute", zIndex: 999,
                                backgroundColor: "red",
                                top: -15,
                                padding: 4,
                                borderRadius: 10
                            }}>
                                <Text style={{ fontSize: 15 }}>
                                    {"  "}<MaterialCommunityIcons

                                        name={"key"}
                                        size={20}
                                        color={"white"}
                                    />
                                    <Text style={{ color: "white" }}> {item.coin}  </Text>
                                </Text>

                            </View>}
                            {isUnlocked && <View style={{
                                position: "absolute", zIndex: 999,
                                backgroundColor: "#126f2c",
                                top: -15,
                                padding: 4,
                                borderRadius: 10
                            }}>
                                <Text style={{ fontSize: 15 }}>
                                    {"  "}<MaterialCommunityIcons

                                        name={"lock-open"}
                                        size={20}
                                        color={"white"}
                                    />
                                    <Text style={{ color: "white" }}> Açıldı   </Text>
                                </Text>

                            </View>}

                        </View>
                        <View style={{ flex: 6 }}>

                            <View style={{ justifyContent: "center", flexDirection: "row" }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18, textAlign: "center" }}>{item.title}</Text>
                            </View>
                            <View><Text>{item.description}... <Text style={{ fontWeight: "bold", color: "#338199" }}>Devamı---{">"}</Text></Text></View>

                        </View>

                    </TouchableOpacity>
                })}
                <View>

                </View>
            </ScrollView>}
            {loadinData && <View style={{ paddingBottom: 25, paddingTop: 15, backgroundColor: "white", width: Dimensions.get("screen").width, bottom: 1, position: "absolute", flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                <Loading></Loading>
            </View>}
        </Background>
    );
}

export default Detail;