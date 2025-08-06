import { View, Text, Image, StyleSheet } from 'react-native';
import { useState } from 'react';
import Sidecar from './Sidecar'
import PostUIBar from './PostUIBar';



// TODO add caption
// TODO add double tap image to like 

export default function Post({ post }) {

  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.profile_pic}
          // source={imageMap[fileNameKey]}
          source={{ uri: post.profile.profile_pic_url }}
          onError={(e) =>
            console.log('Image load error:', e.nativeEvent.error)
          }
        />
        <Text style={styles.username}>{post.userFetchedFrom}</Text>
      </View>
      <Sidecar post={post} />
      <PostUIBar post={post} />
      {/* <Text style={styles.caption}>
        <Text style={styles.captionUsername}>{post.userFetchedFrom}</Text>
        {post.caption}
      </Text> */}
      <Text style={styles.caption}>
        <Text style={styles.captionUsername}>{post.userFetchedFrom} </Text>
        <Text
          numberOfLines={expanded ? undefined : 2}
          ellipsizeMode="clip"
        >
          {post.caption}
        </Text>
        {!expanded && post.caption.length > 0 && (
          <Text style={styles.more} onPress={() => setExpanded(true)}>
            ... more
          </Text>
        )}
      </Text>

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
  },
  caption: {
    color: 'white',
    paddingLeft: 15,
    paddingRight: 15,
  },
  captionUsername: {
    color: 'white',
    paddingRight: 10,
    fontWeight: 'bold'
  },
  more: {
    color: 'gray',
  },
});
