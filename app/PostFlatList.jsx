import {FlatList, StyleSheet, Text, View} from 'react-native'
import postsData from '../data/posts/all_posts.json'
import Post from './Post'

/*
for all_posts.json dummy data order from most recent to earliest


*/

export default function PostFlatList() {
    const allPosts = Object.values(postsData).flat()
    allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return (
        <View style={styles.contaienr}>
            <FlatList 
            // NOTE : data line will change if format of json data changes
            data = {allPosts}
            renderItem = {({item}) => <Post post = {item}/>}
            />
        </View>
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})