import React from 'react';
import { connect } from 'react-redux';
import Background from '../components/Background';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import AdMobBanner from '../components/ads/AdMobBanner';




const OptionList = () => {
    const items = [
      'Aşk için Vefk',
      'Sağlık için Vefk',
      'Büyü Bozma Formülü',
      'Bereket ve Kısmet Açma',
      'Korunma Duaları',
      'Nazar Giderme',
      'Geri Getirme Ritüeli',
      'Kısmet Açma',
      'Kısmet Açma',
      'Kısmet Açma',

    ];

    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {items.map((item, index) => (
          <TouchableOpacity
          delayLongPress={()=>{return true}  }  
            key={index}
            style={styles.option}
            onPress={() => Alert.alert(item, 'Detaylara yönlendiriliyor...')}>
            <Text style={styles.optionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

const BanaOzel = (props) => {
  
    return (
        <Background>
            <View>

            </View>
            <TouchableOpacity  delayLongPress={()=>{return true}  }  style={styles.container} onPress={()=>{}}>
                <Text style={styles.title}>Bana Özel Vefk Oluşturulmasını İstiyorum</Text>
                <Text style={styles.subtitle}>
                    Kendinize ya da bir başkasına "Aşk & Muhabbet, Büyü Bozma, Sağlık ya da Bereket" için formül oluşturmamızı istiyorsanız buraya dokunun.
                </Text>
            </TouchableOpacity>
            <OptionList />
      
        </Background>
    );
}
const styles = StyleSheet.create({
    container: {
      backgroundColor: '#C8E6C9',
      borderRadius: 16,
      padding: 20,
      margin: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#C2185B',
      textAlign:"center"
    },
    subtitle: {
      fontSize: 16,
      color: '#01579B',
      lineHeight: 22,
    },  scroll: {
        flex: 1,
        marginHorizontal: 16,
        width:"100%",
        padding:10
      },
      scrollContent: {
        paddingBottom: 32,
      },
      option: {
        backgroundColor: '#eaeaea',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        width:"100%"
      },
      optionText: {
        fontSize: 16,
        color: '#333',
      },
      bannerWrapper: {
        marginHorizontal: 16,
        marginBottom: 24,
        alignItems: 'center',
      },
  });
  
const mapStateToProps = (state) => {
    return {
        UserData: state
    }
}
const mapDispatchToProps = (dispatch) => {
    // console.log("dispatch")
    return {

        changeUser: (data) => dispatch({ type: "UserData", payload: data })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BanaOzel);

