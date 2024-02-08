import React, { useEffect } from 'react';

import apiConstant from '../helpers/dataApi/apiConstant';
import { GetAxios } from '../helpers/dataApi/crud';
 const LoginControl=()=> {
    useEffect(() => {      console.log("jms");   start()}, [])
 
    const start =  () => {
      
        // var sasa = (await apiConstant.BaseUrl()).integration + "/api/token/GetTokenUserData"
        // var rps = await GetAxios(sasa).then(x => { return x.data }).catch(x => { return false });

        // if (rps == false) {
        //     Updates.reloadAsync()

        // }

    }
    return true
}

export default LoginControl;