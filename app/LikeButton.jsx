import { useState } from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import HeartOutline from '@/assets/icons/HeartOutline'
import HeartFilled from '@/assets/icons/HeartFilled'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LikeButton({shortcode}) {
    const [liked, setLiked] = useState(false)
    const onPress = () => {
        setLiked(!liked)
        const saveLiked = async () => {
        try {
            const jsonValueGet = await AsyncStorage.getItem(shortcode);
            let data = jsonValueGet != null ? JSON.parse(jsonValueGet) : null;
            if (data !== null) {
                // previosuly stored
                data.liked = liked
            } else {
                // not previosuly stored
                data = {
                    "liked" : liked,
                    "saved": false,
                }
            }
            const storeData = async (value) => {
            try {
                const jsonValueSet = JSON.stringify(value);
                await AsyncStorage.setItem(shortcode, jsonValueSet);
            } catch (e) {
                // saving error
            }
            };

        } catch (e) {
            // error reading value
        }
        };
    }

    const getData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('my-key');
        const data =  jsonValue != null ? JSON.parse(jsonValue) : null;
        if (data !== null) {
            setLiked(data.liked)
        } else {
            setLiked(false)
        }
    } catch (e) {
        // error reading value
    }
    saveLiked();
    };

    return (
          <TouchableOpacity 
          onPress = {onPress}>
            {liked ? <HeartFilled color="red"/> : <HeartOutline color="white"/>}
          </TouchableOpacity>
    )

}


// const styles = StyleSheet.create({
//     container: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignContent: 'center',
//     },
// })