import React from 'react'
import Axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'



export const PostAxios = async (url,data) => { 
    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
            Authorization: 'Bearer ' + await AsyncStorage.getItem("hlcapptokengDua")
        }
    }
    return await Axios.post(url, JSON.stringify(data),headers)
}


export const GetAxios = async (url) => {
     
   var tkn= await AsyncStorage.getItem("hlcapptokengDua")

    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
            Authorization: 'Bearer ' + tkn
        }
    }
    return await Axios.get(url, headers)
}
export const GetAxiosAnonym = async (url) => {
    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
            // Authorization: 'Bearer ' + localStorage.getItem("hlcapptokengDua")
        }
    }
    return await Axios.get(url, headers)
}


export const PostAxiosAnonym = async (url,data) => { 
    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
            // Authorization: 'Bearer ' + localStorage.getItem("hlcapptokengDua")
        }
    }
    
    return await Axios.post(url, data,headers)
}











