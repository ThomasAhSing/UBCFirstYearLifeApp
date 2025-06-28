import {FlatList, StyleSheet, Text, View, Image, Dimensions} from 'react-native'
import HeartOutline from '@/assets/icons/HeartOutline'
import HeartFilled from '@/assets/icons/HeartFilled'
import BookmarkOutline from '@/assets/icons/BookmarkOutline'
import BookmarkFilled from '@/assets/icons/BookmarkFilled'

export default function PostUIBar({post}) {
    return (
        <View style = {styles.container}>
            <View style>
                <HeartOutline style = {styles.heart} color= 'white'/>
                <Text>{post.likes}</Text>
            </View>
            
            <BookmarkOutline style = {styles.bookmark} color= 'white'/>
        </View>    
    )

}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
    },
    heart: {
        width: 30,
        height: 30,
    },
    bookmark: {
        width: 30,
        height: 30,
    }
})