import {FlatList, StyleSheet, Text, View, Image, Dimensions} from 'react-native'
import {imageMap} from './Post'
import { useState, useEffect } from 'react'


export default function Sidecar({post}) {
    const screenWidth = Dimensions.get('window').width
    // console.log(imageMap)
    // console.log(100)
    // add implementation for videos
    console.log(screenWidth)
    
    
    
    return (
            <FlatList
                style={styles.container}
                data = {post.media}
                pagingEnabled
                renderItem = {({item}) => (
                    // <View style = {{width: '100%'}}>
                    <Image
                    style = {{width: screenWidth, height: 100}}
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