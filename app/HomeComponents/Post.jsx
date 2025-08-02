import { View, Text, Image, StyleSheet } from 'react-native';
import Sidecar from './Sidecar'
import PostUIBar from './PostUIBar';



// TODO add caption

export default function Post({ post }) {
  const fileNameKey = post.profile.profile_pic_url

  return (
    <View style={styles.container}>
      <View style = {styles.header}>
        <Image
          style={styles.profile_pic}
          // source={imageMap[fileNameKey]}
          source={{ uri: post.profile.profile_pic_url}}
          onError={(e) =>
            console.log('Image load error:', e.nativeEvent.error)
          }
        />
        <Text style={styles.username}>{post.userFetchedFrom}</Text>
      </View>
      <Sidecar post = {post}/>
      <PostUIBar  post = {post}/>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    // backgroundColor: 'gray',
  },
  profile_pic: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  username: {
    color: 'white',
    paddingLeft: 15,
  }
});
