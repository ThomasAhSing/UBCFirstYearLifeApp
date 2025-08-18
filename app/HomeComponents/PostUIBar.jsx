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
 *    - confessions: Array<Confession>  // all share residence + postID
 *    - ci?: number                     // index to focus (defaults to 0)
 *    - confessionIndex?: number        // index of confession to move to front
 */
export default function PostUIBar(props) {
  const { mode } = props;

  // helper to pull shared ids from first confession
  const getIdsFromList = (list = []) => {
    const c = list[0] || {};
    const residence = c.residence ?? c.Residence ?? c.res ?? '';
    const postId = String(c.postID ?? c.postId ?? c.post_id ?? c.id ?? '');
    return { residence, postId };
  };

  // derive an initial like count from the list (fallbacks included)
  const getInitialLikeCount = (list = []) => {
    const c = list[0] || {};
    return (
      c.groupLikes ??
      c.likesGroup ??
      c.likes ??
      0
    );
  };

  // --- Reorder list so confessionIndex element comes first ---
  const reorderedConfessions = React.useMemo(() => {
    if (mode !== 'confessions' || !Array.isArray(props.confessions)) return props.confessions;
    const idx = Number.isFinite(props.confessionIndex) ? props.confessionIndex : -1;
    if (idx < 0 || idx >= props.confessions.length) return props.confessions;

    const arr = [...props.confessions];
    const [target] = arr.splice(idx, 1);
    return [target, ...arr];
  }, [props.confessions, props.confessionIndex, mode]);

  return (
    <View style={styles.container}>
        {mode === 'posts' ? (
          <>
            <LikeButton
              mode={mode}
              post = {props.post}
            />

            <ShareButton
              mode="posts"
              post={props.post}
              style={styles.btn}
            />
          </>
        ) : (
          (() => {
            const ci = Number.isFinite(props.ci) ? props.ci : 0;
            const { residence, postId } = getIdsFromList(reorderedConfessions);
            const initialLikes = getInitialLikeCount(reorderedConfessions);

            return (
              <>
                <LikeButton
                  mode="confessions"
                  confession={props.confessions[0]}
                />

                <ShareButton
                  mode="confessions"
                  confessions={reorderedConfessions}
                  ci={ci}
                  style={styles.btn}
                />
              </>
            );
          })()
        )}
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
  btn: { paddingLeft: 15, paddingRight: 15 },
  saveButton: { paddingRight: 15 },
});
