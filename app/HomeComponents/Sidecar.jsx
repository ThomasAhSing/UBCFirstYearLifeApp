import { useState, useEffect } from 'react'
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native'
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource'
import { imageMap } from './Post'

export default function Sidecar({ post }) { // media is 
    const screenWidth = Dimensions.get('window').width

    const [imgWidth, setImgWidth] = useState(screenWidth);
    const [imgHeight, setImgHeight] = useState(screenWidth);  // default aspect ratio of 1

    useEffect(() => {
        const imgURL = post.media[0]

        Image.getSize(
            imgURL,
            (width, height) => {
                const aspectRatio = height / width;
                setImgWidth(screenWidth)
                setImgHeight(screenWidth * aspectRatio)
            },
            (error) => {
                console.error('❌ Failed to get image size', error);
            })
    }, [post.media[0]])

    // const firstMedia = imageMap[post.media[0].image_url]
    // const { width: firstWidth, height: firstHeight } = resolveAssetSource(firstMedia);
    // const imgWidth = screenWidth;
    // const aspectRatio = firstHeight / firstWidth; 
    // const imgHeight = imgWidth * aspectRatio;

    const [currentIndex, setCurrentIndex] = useState(0)

    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x
        const index = Math.round(offsetX / screenWidth);
        setCurrentIndex(index)
        // console.log(currentIndex)
    }
    // TODO fix when one picture dot doesnt appear
    return (
        <View>
            <FlatList
                style={{ width: imgWidth, height: imgHeight }}
                data={post.media}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                horizontal={true}
                renderItem={({ item }) => {
                    return (
                        <Image
                            style={{ width: imgWidth, height: imgHeight }}
                            resizeMode='cover'
                            // source={imageMap[item.image_url]} 
                            source={{uri: item}} 
                            />
                    )
                }} />
            <View style={styles.dotContainer}>
                {post.media.map((_, index) => (
                    <View key={index}
                        style={[styles.dot, currentIndex == index && styles.activeDot]} />
                ))}
            </View>
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