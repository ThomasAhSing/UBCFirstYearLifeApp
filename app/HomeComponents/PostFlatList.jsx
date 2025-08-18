import { FlatList, StyleSheet, Text } from 'react-native'
import Post from '@/app/HomeComponents/Post'
import { DataContext } from '@/context/DataContext';
import { useContext } from 'react';


export default function PostFlatList() {

  const {
    postData
  } = useContext(DataContext);



  return (

    <FlatList
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
  },

})

