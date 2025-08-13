import { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import BookmarkOutline from '@/assets/icons/BookmarkOutline'
import BookmarkFilled from '@/assets/icons/BookmarkFilled'

export default function SaveButton({ style, shortcode }) {
  const [bookmarked, setBookmarked] = useState(false)


  const onPress = () => {
    const newBookmarked = !bookmarked
    setBookmarked(newBookmarked)
    const saveBookmarked = async () => {
      try {
        const jsonValueGet = await AsyncStorage.getItem(shortcode);
        let data = jsonValueGet != null ? JSON.parse(jsonValueGet) : null;
        if (data != null) {
          // previosuly stored
          data.bookmarked = newBookmarked
        } else {
          // not previosuly stored
          data = {
            "liked": false,
            "bookmarked": newBookmarked,
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
    saveBookmarked()
  }

  useEffect(() => {
    const getBookmarked = async () => {
      setBookmarked(false)
      try {
        const jsonValue = await AsyncStorage.getItem(shortcode);
        const data = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (data?.bookmarked) {
          setBookmarked(true)
        }
      } catch (e) {
        // error reading value
      }
    };
    getBookmarked()
  }, [shortcode])


  return (
    <TouchableOpacity
    style={style}
      onPress={onPress}>
      {bookmarked ? <BookmarkFilled color="#F5BB44" /> : <BookmarkOutline color="white" />}
    </TouchableOpacity>
  )

}

const styles = StyleSheet.create({
  
});