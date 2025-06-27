import { View, Text, Image, StyleSheet } from 'react-native';

export default function Post({ post }) {
  return (
    <View style={styles.container}>
      <Image
        style={styles.profile_pic}
        source={{
          uri: post.profile.profile_pic_url,
        }}
        onError={(e) =>
          console.log('Image load error:', e.nativeEvent.error)
        }
      />
      <Text>{post.username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  profile_pic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'gray', // for debugging
  },
});
