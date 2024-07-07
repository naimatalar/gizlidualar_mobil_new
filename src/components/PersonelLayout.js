import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackButton from "./BackButton";

function PersonelLayout(props) {
    const[menuView,setMenuView]=useState(50)
    return (<View {...props} style={{ flexDirection: "row",flex:1}}>
   


            <View style={{ flexDirection: "column", flex: 4 }}>
                <View>

                        <BackButton goBack={props.navigation?.goBack} />
                </View>
                               

                <ScrollView style={{ flex: 1,marginTop:60}} >
                    {props.children}

                </ScrollView>
            </View>
       


    </View>);
}

export default PersonelLayout;