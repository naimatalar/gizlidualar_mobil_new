import { Text, View } from "react-native"

export default PowerProgress = ({ power }) => {


    return <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "flex-end",paddingLeft:14 }}>
        <View style={{ marginBottom: -4,position:"absolute" ,top:-4,left:0}}>
            <Text style={{ fontWeight: "bold",fontSize:11 }}>Etki  </Text>
        </View>
        {power >= 10 && <View style={{ width: 10, height: 5, backgroundColor: "#64DD17" }}>

        </View>}
        {power >= 30 && <View style={{ width: 10, height: 8, backgroundColor: "#AEEA00" }}>

        </View>}
        {power >= 50 && <View style={{ width: 10, height: 12, backgroundColor: "#FFEA00" }}>

        </View>}
        {power >= 70 && <View style={{ width: 10, height: 15, backgroundColor: "#FFAB00" }}>

        </View>}
        {power >= 85 && <View style={{ width: 10, height: 18, backgroundColor: "#FF3D00" }}>

        </View>}
        <View style={{ marginLeft: 5 }}>
            <Text style={{ fontWeight: "bold", fontSize: 11 }}>%{power}</Text>
        </View>
    </View>
}