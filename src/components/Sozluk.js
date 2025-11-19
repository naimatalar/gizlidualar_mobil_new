import React, { useState } from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import { Dialog } from "react-native-paper";


function Sozluk({sozluk = [], icerik = ""}) {
    const [selectedSozluk, setSelectedSozluk] = useState({})
    const [alertDialog, setAlertDialog] = useState(false)

    const openSozluk = (data) => {
        setSelectedSozluk(data)
        setAlertDialog(true)
    }
    return (
        <View>

            <View>
                <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                    {icerik}
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
            <Dialog visible={alertDialog} onDismiss={() => setAlertDialog(false)} >
                <Dialog.Content>
                    <View>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "red" }}>{selectedSozluk.key}</Text>
                        <Text style={{ fontWeight: "bold", fontSize: 15, color: "black", marginTop: 15 }}>{selectedSozluk.description} </Text>

                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 30, paddingBottom: 5 }}>
                            <TouchableOpacity  delayLongPress={()=>{return true}  }   onPress={() => setAlertDialog(false)} style={{ backgroundColor: "green", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Tamam</Text></TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => setPasswordDialog(false)} style={{ backgroundColor: "red", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Vazgeç</Text></TouchableOpacity> */}

                        </View>
                    </View>

                </Dialog.Content>
            </Dialog>
        </View>



    );
}

export default Sozluk;