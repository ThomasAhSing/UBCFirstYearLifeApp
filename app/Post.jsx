import { View, Text, Image, StyleSheet } from 'react-native';
import Sidecar from './Sidecar'

const imageMap = {
  'pictures/jason_pfp.jpg': require('../data/posts/pictures/jason_pfp.jpg'),
  'pictures/jason_post1_img1.jpg': require('../data/posts/pictures/jason_post1_img1.jpg'),
  'pictures/jason_post1_img2.jpg': require('../data/posts/pictures/jason_post1_img2.jpg'),
  'pictures/jason_post1_img3.jpg': require('../data/posts/pictures/jason_post1_img3.jpg'),
  'pictures/jason_post1_img4.jpg': require('../data/posts/pictures/jason_post1_img4.jpg'),
  'pictures/jason_post1_img5.jpg': require('../data/posts/pictures/jason_post1_img5.jpg'),
  'pictures/jason_post1_img6.jpg': require('../data/posts/pictures/jason_post1_img6.jpg'),
  'pictures/jason_post1_img7.jpg': require('../data/posts/pictures/jason_post1_img7.jpg'),
  'pictures/jason_post1_img8.jpg': require('../data/posts/pictures/jason_post1_img8.jpg'),
  'pictures/jason_post2_img1.jpg': require('../data/posts/pictures/jason_post2_img1.jpg'),
  'pictures/jason_post2_img2.jpg': require('../data/posts/pictures/jason_post2_img2.jpg'),
  'pictures/jason_post2_img3.jpg': require('../data/posts/pictures/jason_post2_img3.jpg'),
  'pictures/jason_post2_img4.jpg': require('../data/posts/pictures/jason_post2_img4.jpg'),
  'pictures/jason_post2_img5.jpg': require('../data/posts/pictures/jason_post2_img5.jpg'),
  'pictures/jason_post2_img6.jpg': require('../data/posts/pictures/jason_post2_img6.jpg'),
  'pictures/jason_post2_img7.jpg': require('../data/posts/pictures/jason_post2_img7.jpg'),
  'pictures/ubctbirds_pfp.jpg': require('../data/posts/pictures/ubctbirds_pfp.jpg'),
  'pictures/ubctbirds_post1_img1.jpg': require('../data/posts/pictures/ubctbirds_post1_img1.jpg'),
  'pictures/ubctbirds_post2_img1.jpg': require('../data/posts/pictures/ubctbirds_post2_img1.jpg'),
  'pictures/ubctbirds_post2_img2.jpg': require('../data/posts/pictures/ubctbirds_post2_img2.jpg'),
  'pictures/ubcwsoccer_pfp.jpg': require('../data/posts/pictures/ubcwsoccer_pfp.jpg'),
  'pictures/ubcwsoccer_post1_img1.jpg': require('../data/posts/pictures/ubcwsoccer_post1_img1.jpg'),
  'pictures/ubcwsoccer_post1_img2.jpg': require('../data/posts/pictures/ubcwsoccer_post1_img2.jpg'),
  'pictures/ubcwsoccer_post2_img1.jpg': require('../data/posts/pictures/ubcwsoccer_post2_img1.jpg'),
};


export default function Post({ post }) {
  const fileNameKey = post.profile.profile_pic_url
  console.log("Looking up key:", fileNameKey);

  return (
    <View style={styles.container}>
      <View style = {styles.header}>
        <Image
          style={styles.profile_pic}
          source={imageMap[fileNameKey]}
          onError={(e) =>
            console.log('Image load error:', e.nativeEvent.error)
          }
        />
        <Text style={styles.username}>{post.username}</Text>
      </View>
      <Sidecar/>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
  },
  username: {
    color: 'white',
    paddingLeft: 15,
  }
});
