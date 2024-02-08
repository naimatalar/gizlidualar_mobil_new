import { Image } from 'react-native';

function Loading({width}) {
    return (    <Image source={require('../assets/loading.gif')} style={{   width: width||30,
        height: width||30  ,
        marginBottom: 8,}} /> );
}

export default Loading;