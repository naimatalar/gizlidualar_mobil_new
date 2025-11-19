import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
const User = (props) => {
    const [userData, setUSerData] = useState(props.UserData?.data || {})
    const [refresh, setRefresh] = useState(new Date())

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
    }
    const deleteMe = async () => {
        Alert.prompt("Uyarı", "Anahtarlarınız dahil bütün bilgileriniz silinecek. Onaylıyor Musunuz", [{
            text: "Tamam",
            onPress: async () => {
            
                var endpoint = await apiConstant.BaseUrl + `/api/usermanager/harddeletecurrent`
                var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
                var sads = await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x });
                props.start()
            },
            style: "default"
        },
        {
            text: "Vazgeç",
            style: "cancel"

        }

        ], "default")


        // if (confirm("Anahtarlarınız dahil bütün bilgileriniz silinecek. Onaylıyor Musunus?")) {
        //     var endpoint = await apiConstant.BaseUrl + `/api/usermanager/harddeletecurrent`
        //     var rps = await GetAxios(endpoint).then(x => { return x.data }).catch(x => { return x });
        //     var sads = await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x });
        //     props.start()
        // }


    }

    return (
        <View style={{ flex: 1 }}>

            {/* Üst kısım - Bilgilerim */}
            <View style={{ height: 80 }}>
                <LinearGradient start={{ x: 0.0, y: 1.0 }} style={{ padding: 7, flex: 1, justifyContent: 'center' }} colors={['#4c669f', 'transparent']} >
                    <Text style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>Bilgilerim</Text>
                </LinearGradient>
            </View>

            {/* Alt kısım - Butonlar */}
            <View style={{ flex: 2 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 17 }}>E-mail: </Text>
                    <Text style={{ fontSize: 17 }}>{userData.email} </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 17 }}>Kullanıcı Adı: </Text>
                    <Text style={{ fontSize: 17 }}>{userData.phoneNumber} </Text>
                </View>
               
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>
                    <TouchableOpacity  delayLongPress={()=>{return true}  }  style={{ backgroundColor: "orange", padding: 5, paddingHorizontal: 15, borderRadius: 8 }} onPress={async() => {
                        var tkn = await AsyncStorage.removeItem("hlcapptokengDua").then(x => { return x })
                        props.start();
                    }}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                    <TouchableOpacity  delayLongPress={()=>{return true}  }  style={{ backgroundColor: "red", padding: 5, paddingHorizontal: 15, borderRadius: 8 }} onPress={() => deleteMe()}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>Hesabı Sil</Text>
                    </TouchableOpacity>
                </View>
                {/* <View style={{ marginTop: 20, borderColor: "orange", borderWidth: 1, borderStyle: "solid", width: "98%", alignSelf: "center", backgroundColor: "#FFF4EE" }}>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 20, color: "white", backgroundColor: "orange", padding: 5 }}>Anahtar Sayısı: {userData.coin} </Text>

                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15, marginBottom: 15 }}>
                        <Text style={{ fontWeight: "bold", color: "#4c669f", fontStyle: "italic" }}>Anahtarlar duaların kilidini açar</Text>

                    </View>
                </View> */}
                
                {/* Yeni Butonlar */}
                <View style={styles.buttonsContainer}>
                    {/* İki yan yana buton */}
                    <View style={styles.rowButtons}>
                        <TouchableOpacity delayLongPress={()=>{return true}  }  
                            style={[styles.button, styles.halfButton]}
                            onPress={() => {
                                // Tab navigator'a navigate et
                                props.navigation.getParent()?.navigate('Sureler')
                            }}
                        >
                            <MaterialCommunityIcons name="headphones" size={24} color="#4A148C" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Sure Dinle</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity delayLongPress={()=>{return true}  }  
                            style={[styles.button, styles.halfButton]}
                            onPress={() => {
                                // Tab navigator'a navigate et
                                props.navigation.getParent()?.navigate('OzelAlanim')
                            }}
                        >
                            <MaterialCommunityIcons name="hands-pray" size={24} color="#4A148C" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Niyet Duası Oluştur</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Premium Özellikler Kartı */}
                    <View style={styles.premiumCard}>
                        {/* Alt kısımda uzun buton - Kartın içinde */}
                        <TouchableOpacity delayLongPress={()=>{return true}  }  
                            style={[styles.premiumButton, styles.fullButton]}
                            onPress={() => {
                                props.navigation.navigate('RemoveAds')
                            }}
                        >
                            <MaterialCommunityIcons name="crown" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                            <Text style={styles.premiumButtonText}>Reklamsız/Premium</Text>
                        </TouchableOpacity>
                        
                        <View style={[styles.premiumFeatureItem, { marginTop: 12, marginBottom: 8 }]}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" style={styles.premiumIcon} />
                            <Text style={styles.premiumFeatureText}>Reklamsız</Text>
                        </View>
                        <View style={styles.premiumFeatureItem}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" style={styles.premiumIcon} />
                            <Text style={styles.premiumFeatureText}>Arka planda dinleme özelliği</Text>
                        </View>
                    </View>
                </View>
            </View>

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

const styles = StyleSheet.create({
    buttonsContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    rowButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        gap: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#4A148C',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    halfButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    fullButton: {
        width: '100%',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#4A148C',
        fontSize: 14,
        fontWeight: '600',
    },
    premiumCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#2E7D32',
    },
    premiumButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    premiumButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    premiumFeatureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    premiumIcon: {
        marginRight: 10,
    },
    premiumFeatureText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(User);

