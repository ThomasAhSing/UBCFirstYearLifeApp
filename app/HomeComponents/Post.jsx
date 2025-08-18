import { View, Text, Image, StyleSheet } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'; // ← updated API
import Sidecar from './Sidecar';
import PostUIBar from './PostUIBar';

// shared like toggle (assumes likes.js from earlier)
import { toggleLikedByKey } from '@/lib/likes';

export default function Post({ post }) {
  const [expanded, setExpanded] = useState(false);

  // compute storage key once for this post
  const storageKey = useMemo(() => String(post?.shortcode ?? '').trim(), [post]);

  // double-tap handler
  const onDoubleTap = useCallback(async () => {
    if (!storageKey) return;
    await toggleLikedByKey(storageKey);
    // (optional) trigger a heart animation overlay here
  }, [storageKey]);

  // gesture: double tap
  const doubleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd((_e, success) => {
          if (success) onDoubleTap();
        }),
    [onDoubleTap]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.profile_pic}
          source={{ uri: post.profile.profile_pic_url }}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
        <Text style={styles.username}>{post.userFetchedFrom}</Text>
      </View>

      {/* wrap Sidecar with double-tap */}
      {/* <GestureHandlerRootView> */}
        {/* <GestureDetector gesture={doubleTapGesture}> */}
          <View>
            <Sidecar post={post} />
          </View>
        {/* </GestureDetector> */}
      {/* </GestureHandlerRootView>  */}

      <PostUIBar mode="posts" post={post} />
      <Text
        style={styles.caption}
        numberOfLines={expanded ? undefined : 2}
        ellipsizeMode="tail"
        onPress={() => !expanded && setExpanded(true)}
        suppressHighlighting
      >
        <Text style={styles.captionUsername}>{post.userFetchedFrom} </Text>
        {post.caption}
        {!expanded && post.caption?.length > 0 && (
          <Text style={styles.more}> … more</Text>
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
    fontWeight: 'bold',
  },
  more: {
    color: 'gray',
  },
});
