import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { View } from 'react-native';
import { connect } from 'react-redux';
import Background from '../../components/Background';

import apiConstant from '../../helpers/dataApi/apiConstant';
import { GetAxios } from '../../helpers/dataApi/crud';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
function CoinCounter(props) {
 
console.log("PPPPPPppppppp",props)

 
  
  return <><Text>10</Text></> 
}
const mapStateToProps = (state) => {
  return {
      UserData: state
  }
}
const mapDispatchToProps = (dispatch) => {
  
  return { 

      changeUser: (data) => dispatch({ type: "UserData", payload: data })
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CoinCounter);

