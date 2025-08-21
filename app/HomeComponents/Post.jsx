import { View, Text, Image, StyleSheet } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import PostUIBar from './PostUIBar';
import Sidecar from './Sidecar';
import { toggleLikedByKey } from '@/lib/likes';

export default function Post({ post, hiddenReason, onUserBlocked }) {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false); // local immediate cover for this card

  const storageKey = useMemo(() => String(post?.shortcode ?? '').trim(), [post]);

  const onDoubleTap = useCallback(async () => {
    if (!storageKey) return;
    await toggleLikedByKey(storageKey);
  }, [storageKey]);

  // decide if we should show a cover and which message to show
  const isHidden = hidden || !!hiddenReason;
  const hiddenMessage = hidden
    ? 'This post was hidden.'
    : hiddenReason === 'blocked'
      ? `Post hidden from ${post?.userFetchedFrom ?? 'blocked user'}.`
      : hiddenReason === 'hidden'
        ? 'This post was hidden.'
        : '';

  if (isHidden) {
    return (
      <View style={[styles.container, styles.hiddenCard]}>
        <Text style={styles.hiddenText}>{hiddenMessage}</Text>
      </View>
    );
  }

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

      <View>
        <Sidecar post={post} />
      </View>

      <PostUIBar
        mode="posts"
        post={post}
        onHide={() => setHidden(true)}          // immediate cover on "Hide post"
        onBlocked={() => setHidden(true)}       // immediate cover on "Block user" (this card)
        onBlockUser={onUserBlocked}             // tell the list to mark other rows as blocked
      />

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
  container: { width: '100%', paddingTop: 10, paddingBottom: 10 },
  hiddenCard: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f2941',
    borderRadius: 12,
    marginHorizontal: 10,
  },
  hiddenText: { color: '#cfe3ff' },
  profile_pic: { width: 30, height: 30, borderRadius: 25, marginLeft: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 10 },
  username: { color: 'white', paddingLeft: 15 },
  caption: { color: 'white', paddingLeft: 15, paddingRight: 15 },
  captionUsername: { color: 'white', paddingRight: 10, fontWeight: 'bold' },
  more: { color: 'gray' },
});
