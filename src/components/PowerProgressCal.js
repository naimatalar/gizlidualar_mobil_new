import { Text, View } from "react-native"
import { LangApp } from "./Language"

const PowerProgressCal = ({ power }) => {


    return <View style={{ flexDirection: "row", alignItems: "flex-end",paddingLeft:4 ,marginTop:-20}}>
     
        {power >= 10 && <View style={{ width: 17, height: 7, backgroundColor: "#64DD17" }}>

        </View>}
        {power >= 30 && <View style={{ width: 17, height: 10, backgroundColor: "#AEEA00" }}>

        </View>}
        {power >= 50 && <View style={{ width: 17, height: 16, backgroundColor: "#FFEA00" }}>

        </View>}
        {power >= 70 && <View style={{ width: 17, height: 18, backgroundColor: "#FFAB00" }}>

        </View>}
        {power >= 85 && <View style={{ width: 17, height: 21, backgroundColor: "#FF3D00" }}>

        </View>}
        <View style={{ marginLeft: 5 }}>
            <Text style={{ fontWeight: "bold", fontSize: 11 }}>%{power}</Text>
        </View>
    </View>
}

export default PowerProgressCal;