import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,

  TouchableOpacity,
  Image
} from "react-native";
import { connect } from "react-redux";
import BackButton from "../../components/BackButton";
import Background from "../../components/Background";
import LangApp from "../../components/Language";
import StudentLAyout from "../../components/StudentLayout";
import { StudentData } from "../../helpers/model/StudentModel";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dialog } from "react-native-paper";
import apiConstant from "../../helpers/dataApi/apiConstant";
import { GetAxios, PostAxios } from "../../helpers/dataApi/crud";
function StudentHomeScreen(props) {
  const [loading, setLoading] = useState(true);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  useEffect(() => {

    if (props.user.detail.epostA2 == null || props.user.detail.epostA2 == "") {
      setAlertDialog(true)
      setAlertText(LangApp("EmailDismisAlert"))
    }
    if (props.user.detail.gsM1 == null || props.user.detail.gsM1 == "") {
      setAlertDialog(true)
      setAlertText(LangApp("PhoneDismisAlert"))
    }
    setTimeout(() => {
      setLoading(false)
    }, 800);
  }, [])
  Object.assign(StudentData, props.user.detail)
  // console.log(props.user.detail)
  if (loading) {
    return <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
      <Image source={require("../../assets/loading.gif")} style={{ width: 70, height: 70 }}></Image>
    </View>
  }
  const resetPass = async () => {
    var endpoint = (await apiConstant.BaseUrl()).integration + "/api/ActiveDirectory/ResetPasswordWithInfo"
    var rps = await PostAxios(endpoint, { tckn: "", ogrNo: props.user.detail.ogR_NO,phoneNumber:props.user.detail.gsM1,email:props.user.detail.epostA2}).then(x => { return x.data }).catch(x => { return x });





    console.log([endpoint, rps ])

    setPasswordSent(true);
    setPasswordLoading(false)
  }

  return (
    <Background >
      <StudentLAyout navigation={props.navigation} >

        <View style={styles.container}>
          <View style={styles.header}>
            <Image style={styles.headerImage} source={require("../../assets/logo_.png")} />

          </View>
          <Image style={styles.avatar} source={{ uri: StudentData.picture }} />
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <Text style={styles.name}>{StudentData.ogR_ADI + " " + StudentData.ogR_SOYAD}</Text>
              <Text style={styles.info}>{StudentData.fakultE_AD + " / " + StudentData.boluM_AD}</Text>
              <Text style={{ fontSize: 14, color: "black", marginTop: 5 }}>{StudentData.epostA1}</Text>
              <View style={{ flexDirection: "row", borderWidth: 1, borderColor: "#ede7f6", width: "108%", marginTop: 5 }}></View>
              <View style={{ flexDirection: "row", marginTop: 30, justifyContent: "space-between", width: "100%" }}>
                <View style={{ width: 120 }}>
                  <Text style={styles.propText} ><Icon name="building" size={15} color="#29434e" />  {LangApp("YearTerm")}</Text>
                  <Text style={styles.propInfo} >{StudentData.sinif + ".Sınıf " + StudentData.okudugU_DONEM + ".Dönem "}</Text>
                </View>
                <View style={{ width: 150 }}>
                  <Text style={styles.propText} ><Icon name="birthday-cake" size={15} color="#29434e" />  {LangApp("BirthDay")} </Text>
                  <Text style={styles.propInfo}  >{StudentData.d_TARIH}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", marginTop: 18, justifyContent: "space-between", width: "100%" }}>
                <View style={{ width: 120 }}>
                  <Text style={styles.propText}  ><Icon name="phone" size={15} color="#29434e" />  {LangApp("Phone")}</Text>
                  <Text style={styles.propInfo}  >{StudentData.gsM1}</Text>
                </View>
                <View style={{ width: 150 }}>
                  <Text style={styles.propText}  ><Icon name="id-card" size={15} color="#29434e" />  {LangApp("StudentNo")} </Text>
                  <Text style={styles.propInfo} >{StudentData.ogR_NO}</Text>
                </View>

              </View>

              {/* <View style={{ flexDirection: "row", marginTop: 30, justifyContent: "space-between", width: "100%" }}>
                <TouchableOpacity style={styles.buttonContainer}>
                  <Text style={{ fontWeight: "bold" }}>{LangApp("Advisor")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonContainer}>
                  <Text style={{ fontWeight: "bold" }}>{LangApp("Lessons")}</Text>
                </TouchableOpacity>
              </View> */}


              <View style={{ flexDirection: "row", marginTop: 40, justifyContent: "space-between", width: "100%" }}>
                <TouchableOpacity onPress={() => props.navigation.navigate("StudentLessonScores_")} style={{ width: "100%", backgroundColor: "#00675b", padding: 10, borderRadius: 41, flexDirection: "row", justifyContent: "center" }}>
                  <Text style={{ fontWeight: "bold", color: "white", fontSize: 18 }}><Icon name="book" size={20} color="white" /> {"  " + LangApp("Lessons")}</Text>
                </TouchableOpacity>
              </View>


              <View style={{ flexDirection: "row", marginTop: 15, justifyContent: "space-between", width: "100%" }}>
                <TouchableOpacity onPress={() => props.navigation.navigate("InformationAcademician_")} style={{ width: "100%", backgroundColor: "#005cb2", padding: 10, borderRadius: 41, flexDirection: "row", justifyContent: "center" }}>
                  <Text style={{ fontWeight: "bold", color: "white", fontSize: 18 }}><Icon name="graduation-cap" size={20} color="white" /> {" " + LangApp("Advisor")}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", marginTop: 15, justifyContent: "space-between", width: "100%" }}>
                <TouchableOpacity onPress={() => setPasswordDialog(true)} style={{ width: "100%", backgroundColor: "#4a0072", padding: 10, borderRadius: 41, flexDirection: "row", justifyContent: "center" }}>
                  <Text style={{ fontWeight: "bold", color: "white", fontSize: 18 }}><Icon name="key" size={20} color="white" /> {" " + LangApp("PasswordChange")}</Text>
                </TouchableOpacity>

              </View>


            </View>
          </View>
        </View>
      </StudentLAyout>
      <Dialog visible={passwordDialog} onDismiss={() => setPasswordDialog(false)} >
        <Dialog.Content>
          <View>
            <Text>{LangApp("PaswordSmsAlert")}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>{LangApp("DoYouApprove")}</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 30, paddingBottom: 20 }}>
              <TouchableOpacity onPress={() => { setPasswordLoading(true); resetPass() }} style={{ backgroundColor: "green", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Onayla</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setPasswordDialog(false)} style={{ backgroundColor: "red", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Vazgeç</Text></TouchableOpacity>

            </View>
            <View style={{ alignItems: "center", marginBottom: 10, marginTop: 10 }} >
              {passwordLoading &&
                <Image style={{ width: 50, height: 50 }} source={require("../../assets/loading.gif")}></Image>
              }
              {passwordSent &&
                <Text style={{ color: "green", fontSize: 17, fontWeight: "bold" }}>{LangApp("PaswordSent")}</Text>
              }

            </View>
          </View>

        </Dialog.Content>
      </Dialog>

      <Dialog visible={alertDialog} onDismiss={() => setAlertDialog(false)} >
        <Dialog.Content>
          <View>
            <Text>{alertText}</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 30, paddingBottom: 20 }}>
              <TouchableOpacity onPress={() => setAlertDialog(false)} style={{ backgroundColor: "green", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Ok</Text></TouchableOpacity>
              {/* <TouchableOpacity onPress={() => setPasswordDialog(false)} style={{ backgroundColor: "red", width: 100, justifyContent: "center" }}><Text style={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16, padding: 8 }}>Vazgeç</Text></TouchableOpacity> */}

            </View>
          </View>

        </Dialog.Content>
      </Dialog>

    </Background>
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
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#00BFFF",
    height: 110,

  },
  propText: { flex: 3, fontSize: 12, marginBottom: 3, color: "#29434e" },
  propInfo: { flex: 5, fontSize: 16, color: "#455a64", fontWeight: "bold" },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 30
  },
  headerImage: {
    width: "100%",
    height: 110,
    opacity: .5,
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
  },
  name: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: '600',
  },
  body: {
    marginTop: 40,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
  },
  name: {
    fontSize: 20,
    color: "#696969",
    fontWeight: "600"
  },
  info: {
    fontSize: 16,
    color: "#00BFFF",
    marginTop: 5
  },
  description: {
    fontSize: 16,
    color: "#696969",
    marginTop: 1,
    textAlign: 'center',
    fontWeight: "bold"
  },
  buttonContainer: {
    marginTop: 10,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 150,
    borderRadius: 30,
    fontWeight: "bold",
    backgroundColor: "#00BFFF",
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(StudentHomeScreen);
