import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';


import moment from 'moment';
// if (DeviceLanguage=="tr") {
// require("moment/locale/en")
// require("dayjs/locale/en")
// }
    // import 'moment/locale/tr';
// import 'dayjs/locale/tr'

import { TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DeviceLanguage } from './Language';


function DatePicker({value,onChange,activeDate}) {
    const [datetimePicker, setDatetimePicker] = useState(false)
    return (
        <>
            {
                Platform.OS == "ios" && <DateTimePicker
                    testID="dateTimePicker"
                    value={new Date(value)}
                    mode={"date"}

                    locale={DeviceLanguage=="ar"?"ar":"tr"}
                    is24Hour={true}
                    onChange={onChange}
                />
            }
            {

                Platform.OS != "ios" && <>
                    <TouchableOpacity style={{ padding: 5, backgroundColor: "#BDBDBD" }} onPress={() => setDatetimePicker(2)}>
                        <Text>{moment(activeDate).format("DD/MM/yyy")} </Text> 
                    </TouchableOpacity>
                    {datetimePicker == 2 && <DateTimePicker
                        testID="dateTimePicker"
                        value={new Date(value)}
                        mode={"date"}
                        display="default"
                        locale={DeviceLanguage=="ar"?"ar":"tr"}
                        is24Hour={true}
                        onChange={(e,d)=>{onChange(e,d);setDatetimePicker(false)}}

                    />}
                </>
            }
        </>
    );
}

export default DatePicker;