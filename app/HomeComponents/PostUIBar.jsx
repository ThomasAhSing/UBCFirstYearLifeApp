import React from 'react';
import { StyleSheet, View } from 'react-native';

import LikeButton from '@/app/uiButtons/LikeButton';
import ShareButton from '@/app/uiButtons/ShareButton';
import SaveButton from '@/app/uiButtons/SaveButton';

/**
 * Props:
 *  mode="posts"
 *    - post: { shortcode, likes, caption, confessions? }
 *
 *  mode="confessions"
 *    - residence: string
 *    - postId: string
 *    - ci: number                 // current confession index (0-based)
 *    - content: string               // current confession content (for share preview)
 *    - likes?: number             // shared like count for the group
 *    - confession?: object        // (optional) full confession object at ci
 *    - onLikesUpdate?: (n)=>void  // (optional) update shared count in parent
 */
export default function PostUIBar(props) {
  const { mode } = props;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {mode === 'posts' ? (
          <>
            <LikeButton
              mode="posts"
              shortcode={props.post.shortcode}
              initialCount={props.post.likes ?? 0}
              showCount
              style={styles.btn}
            />

            <ShareButton
              mode="posts"
              shortcode={props.post.shortcode}
              preview={props.post.caption || (props.post.confessions?.[0]?.content || '')}
              // previewImageUrl={props.post.images?.[0]} // <- optional if you have one
              style={styles.btn}
            />
          </>
        ) : (
          <>
            <LikeButton
              mode="confessions"
              residence={props.residence}
              postId={props.postId}
              // index={props.ci ?? 0} // <- not needed for group likes; keep only if your LikeButton still expects it
              initialCount={props.likes ?? 0}
              onCountChange={props.onLikesUpdate}
              showCount
              style={styles.btn}
            />

            <ShareButton
              mode="confessions"
              residence={props.residence}
              postId={props.postId}
              ci={props.ci ?? 0}                               // open at this confession
              preview={props.content || props.confession?.content || ''}
              confession={props.confession}                    // pass through for future image use
              style={styles.btn}
            />
          </>
        )}
      </View>

      {mode === 'posts' ? <SaveButton style={styles.saveButton} shortcode={props.post.shortcode} /> : <View />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: { paddingLeft: 15 },
  saveButton: {
    paddingRight: 15
  }
});

