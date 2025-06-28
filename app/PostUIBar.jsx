import {FlatList, StyleSheet, Text, View, Image, Dimensions} from 'react-native'
import HeartOutline from '@/assets/icons/HeartOutline'
import HeartFilled from '@/assets/icons/HeartFilled'
import BookmarkOutline from '@/assets/icons/BookmarkOutline'
import BookmarkFilled from '@/assets/icons/BookmarkFilled'

export default function PostUIBar({post}) {
    return (
        <View style = {styles.container}>
            <View style = {styles.likeContainer}>
                <HeartOutline style = {styles.heart} color= 'white'/>
                <Text style={styles.likeCount}>{post.likes}</Text>
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
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heart: {
        width: 30,
        height: 30,
    },
    likeCount: {
        color: 'white',
        justifyContent: 'center'
    },
    bookmark: {
        width: 30,
        height: 30,
    }
})