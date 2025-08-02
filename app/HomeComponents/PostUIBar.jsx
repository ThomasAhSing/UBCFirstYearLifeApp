import { StyleSheet, Text, View } from 'react-native'
import LikeButton from '@/app/uiButtons/LikeButton'
import SaveButton from '@/app/uiButtons/SaveButton'

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
        paddingLeft: 10,
        paddingRight: 10,
    },
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeIcon: {
        
    },
    likeCount: {
        paddingLeft: 5,
        color: 'white',
        justifyContent: 'center'
    },
    bookmark: {
        width: 30,
        height: 30,
    }
})