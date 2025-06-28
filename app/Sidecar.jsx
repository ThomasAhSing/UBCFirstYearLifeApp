import {FlatList, StyleSheet, Text, View, Image} from 'react-native'
import {imageMap} from './Post'
import { useState, useEffect } from 'react'


export default function Sidecar({post}) {
    const [ratios, setRatios] = useState({});
    // console.log(imageMap)
    // console.log(100)
    // add implementation for videos

    
    
    
    return (
            <FlatList
                style={styles.container}
                data = {post.media}
                
                renderItem = {({item}) => (
                    // <View style = {{width: '100%'}}>
                    <Image
                    style = {styles.sidecarImage}
                    source={imageMap[item.image_url]}
                    
                />
                // </View>
                )
                }
                horizontal = {true}
            />
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    backgroundColor: 'gray',
    height: 100,

    },
    sidecarImage: {
        // flex: 1,
        // width: '100%',
        // height: null,
        width: 100,
        height: 100,
        resizeMode: 'cover'
    }
})