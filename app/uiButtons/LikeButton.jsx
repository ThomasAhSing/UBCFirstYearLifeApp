import { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import HeartOutline from '@/assets/icons/HeartOutline'
import HeartFilled from '@/assets/icons/HeartFilled'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LikeButton({ style, shortcode }) {
  const [liked, setLiked] = useState(false)

  // TODO increase like count 

  const onPress = () => {
    const newLiked = !liked
    setLiked(newLiked)
    const saveLiked = async () => {
      try {
        const jsonValueGet = await AsyncStorage.getItem(shortcode);
        let data = jsonValueGet != null ? JSON.parse(jsonValueGet) : null;
        if (data != null) {
          // previosuly stored
          data.liked = newLiked
        } else {
          // not previosuly stored
          data = {
            "liked": newLiked,
            "bookmarked": false,
          }
        }

        try {
          const jsonValueSet = JSON.stringify(data);
          await AsyncStorage.setItem(shortcode, jsonValueSet);
        } catch (e) {
          // saving 
          console.log("error saving")
        }

      } catch (e) {
        // error reading value
        console.log("error reading", e)

      }
    };
    saveLiked()
  }

  useEffect(() => {
    const getLiked = async () => {
      setLiked(false)
      try {
        const jsonValue = await AsyncStorage.getItem(shortcode);
        const data = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (data?.liked) {
          setLiked(true)
        }
      } catch (e) {
        // error reading value
      }
    };
    getLiked()
  }, [shortcode])


  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}>
      {liked ? <HeartFilled color="red" /> : <HeartOutline color="white" />}
    </TouchableOpacity>
  )

}
