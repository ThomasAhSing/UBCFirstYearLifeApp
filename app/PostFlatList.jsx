import {FlatList, StyleSheet, Text, View} from 'react-native'
import postsData from '../data/posts/all_posts.json'
import Post from './Post'


export default function PostFlatList() {
    const allPosts = Object.values(postsData).flat()
    allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return (
        
        <FlatList 
        // NOTE : data line will change if format of json data changes
        style={styles.container}
        data = {allPosts}
        renderItem = {({item}) => <Post post = {item}/>}
        />
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },

})

{/* <View style={styles.container}>
            <FlatList 
            // NOTE : data line will change if format of json data changes
            data = {allPosts}
            renderItem = {({item}) => <Post post = {item}/>}
            />
        </View> */}