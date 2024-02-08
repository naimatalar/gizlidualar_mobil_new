import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { connect } from 'react-redux';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';

function InformationAcademician(props) {
    const [data, setData] = useState([])
    useEffect(() => {
        start()
    }, [])
    const start = async () => {


        let arr = [];
        for (let index = 1; index < 4; index++) {
            if (props.user.detail["danismaN_" + index]) {

                var endpoint = (await apiConstant.BaseUrl()).integration + "/api/UyumSoft/GetByTckn/" + props.user.detail["danismaN_" + index]
                var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
               
                arr.push(rps.data[0])
            }


        }
    
        setData(arr)
    }
    return (
        <ScrollView style={{ height: "100%" }}>
            {data.map((item, key) => {

                return <View style={{borderBottomColor:"black",borderStyle:"solid",borderBottomWidth:1,paddingBottom:28}}><View style={[{ flexDirection: "row",marginTop:20},key!=0&&{ marginTop: 50} ]}>
                    <View style={{ width: 130, height: 130 }}>
                        <Image source={{ uri: item.fotograf }} style={{ resizeMode: "contain", width: "100%", height: "100%" }}></Image>

                    </View>

                    <View style={{ width: "100%", height: 130 }}>
                        <Text style={{ fontWeight: "bold" }}>{item.adSoyad}</Text>
                        <Text style={{ fontWeight: "bold", marginTop: 10 }}>Ünvan</Text>
                        <Text>{item.unvan}</Text>
                        <Text style={{ fontWeight: "bold", marginTop: 10 }}>Görev</Text>
                        <Text>{item.gorev}</Text>
                    </View>

                </View>
                    <View style={{  flexDirection: "row",flex:1,justifyContent:"space-between" ,paddingLeft:10,paddingRight:10,marginTop:25}}>
                        <View>
                            <Text style={{ fontWeight: "bold", marginTop: 10 }}>E-Mail</Text>
                            <Text>{item.isEMail}</Text>
                        </View>
                        <View>
                            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Telefon</Text>
                            <Text>{item.mobilTel}</Text>
                        </View>
                        
                    </View>
                </View>
            })}

        </ScrollView>
    );
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
export default connect(mapStateToProps, mapDispatchToProps)(InformationAcademician);