import {FlatList, StyleSheet, Text, View, Image} from 'react-native'
import {imageMap} from './Post'



export default function Sidecar({post}) {
    // console.log(imageMap)
    // console.log(100)
    // add implementation for videos
    return (
            <FlatList
                style={styles.container}
                data = {post.media}
                renderItem = {({item}) => 
                <Image
                    style = {styles.sidecarImage}
                    source={imageMap[item.image_url]}
                />}
                horizontal = {true}
            />
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        // aspectRatio: 1
    },
    sidecarImage: {
        flex: 1,
        width: '100%',
        // width: 200,
        // height: '100%',
        height: 'auto',
        resizeMode: 'cover',
    }
})