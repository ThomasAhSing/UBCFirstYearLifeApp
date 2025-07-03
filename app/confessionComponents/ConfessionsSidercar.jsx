import { useState } from 'react'
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native'
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource'
import { imageMap } from './Post'
import RenderedConfession from './RenderedConfession'

export default function ConfessionsSidercar({confessions}) { // media is 
    const postSize = Dimensions.get('window').width

    const [currentIndex, setCurrentIndex] = useState(0)
    
    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x
        const index = Math.round(offsetX / screenWidth);
        setCurrentIndex(index)
        console.log(currentIndex)
    }
    // TODO fix when one picture dot doesnt appear
    return (
        <View>
                <FlatList
                style={{width: postSize, height: postSize}}
                data = {confessions}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                horizontal = {true}
                renderItem = {({item}) => {
                return (
                    <RenderedConfession confession={item}/>
                )}}/>
                {/* <View style={styles.dotContainer}>
                    {post.media.map((_, index) => (
                        <View key={index}
                        style = {[styles.dot, currentIndex == index && styles.activeDot]}/>
                    ))}
                </View> */}
        </View>    
    )

}


const styles = StyleSheet.create({
    dotContainer: {
        // position: 'absolute',
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1,
    },
    dot: {
        marginLeft: 2,
        marginRight: 2,
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: '#A77F2E'
    }, 
    activeDot: {
        backgroundColor: '#F5D054'
    }
})