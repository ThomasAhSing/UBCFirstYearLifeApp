import {FlatList, StyleSheet, Text, View, Image, Dimensions} from 'react-native'
import LikeButton from './LikeButton'
import SaveButton from './SaveButton'

export default function PostUIBar({post}) {
    return (
        <View style = {styles.container}>
            <View style = {styles.likeContainer}>
                {/* <HeartOutline style = {styles.heart} /> */}
                <LikeButton shortcode={post.shortcode}/>
                <Text style={styles.likeCount}>{post.likes}</Text>
            </View>
            
            <SaveButton shortcode={post.shortcode}/>
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