import { FlatList, StyleSheet, Text } from 'react-native'
import postsData from '@/data/posts/all_posts.json'
import Post from './Post'
import axios from 'axios'
import { useState, useEffect } from 'react'


export default function PostFlatList() {

  const [postData, setPostData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await axios.get("http://localhost:10000/api/posts")
        console.log(res.data.posts)
        setPostData(res.data.posts);
      } catch (err) {
        console.error('Failed to fetch posted confessions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPostData();
  }, [])

  if (loading) {
    return <Text style={{ color: 'white' }}>Loading...</Text>;
  }

  const allPosts = Object.values(postsData).flat()
  allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (

    <FlatList
      // NOTE : data line will change if format of json data changes
      style={styles.container}
      data={postData}
      renderItem={({ item }) => <Post post={item} />}
    />
  )

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    // backgroundColor: 'gray'
  },

})

