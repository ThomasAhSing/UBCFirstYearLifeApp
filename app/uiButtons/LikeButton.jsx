import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import HeartOutline from '@/assets/icons/HeartOutline';
import HeartFilled from '@/assets/icons/HeartFilled';
import {
  keyForPost, keyForConfession,
  getLikedByKey, toggleLikedByKey, likesEvents
} from '@/lib/likes';

export default function LikeButton({ mode = 'posts', post, confession, confessions, style, onChange }) {
  const pickConf = () => {
    if (confession && typeof confession === 'object') return confession;
    if (Array.isArray(confessions) && confessions.length) return confessions[0];
    return null;
  };

  const storageKey = useMemo(() => {
    return mode === 'posts'
      ? keyForPost(post)
      : keyForConfession(pickConf());
  }, [mode, post, confession, confessions]);

  const [liked, setLiked] = useState(false);

  // Load initial state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!storageKey) { setLiked(false); return; }
      const v = await getLikedByKey(storageKey);
      if (!cancelled) setLiked(v);
    })();
    return () => { cancelled = true; };
  }, [storageKey]);

  // Subscribe to external changes (e.g., double-tap elsewhere)
  useEffect(() => {
    const off = likesEvents.on(({ key, liked: v }) => {
      if (key === storageKey) {
        setLiked(v);
        onChange?.(v);
      }
    });
    return off;
  }, [storageKey, onChange]);

  const toggleLike = useCallback(async () => {
    if (!storageKey) return;
    const next = await toggleLikedByKey(storageKey);
    setLiked(next);
    onChange?.(next);
  }, [storageKey, onChange]);

  return (
    <TouchableOpacity style={[styles.hit, style]} onPress={toggleLike} hitSlop={8}>
      {liked ? <HeartFilled color="red" /> : <HeartOutline color="white" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 8, alignItems: 'center', justifyContent: 'center' },
});


// // LikeButton.jsx
// import React, {
//   useEffect, useMemo, useState, useCallback, forwardRef, useImperativeHandle
// } from 'react';
// import { StyleSheet, TouchableOpacity } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import HeartOutline from '@/assets/icons/HeartOutline';
// import HeartFilled from '@/assets/icons/HeartFilled';

// function LikeButtonImpl(props, ref) {
//   const { mode = 'posts', post, confession, confessions, style } = props;

//   const pickConf = () => {
//     if (confession && typeof confession === 'object') return confession;
//     if (Array.isArray(confessions) && confessions.length) return confessions[0];
//     return null;
//   };

//   const storageKey = useMemo(() => {
//     if (mode === 'posts') {
//       const sc = String(post?.shortcode ?? '').trim();
//       return sc;
//     }
//     const c = pickConf() || {};
//     const residence = String(c.residence ?? c.Residence ?? c.res ?? '').trim();
//     const postId = String(c.postID ?? c.postId ?? c.post_id ?? c.id ?? '').trim();
//     return residence && postId ? `conf:${residence}:${postId}` : '';
//   }, [mode, post, confession, confessions]);

//   const [liked, setLiked] = useState(false);

//   const readStore = useCallback(async (key) => {
//     try {
//       const raw = await AsyncStorage.getItem(key);
//       return raw ? JSON.parse(raw) : null;
//     } catch {
//       return null;
//     }
//   }, []);

//   const writeStore = useCallback(async (key, nextLiked) => {
//     try {
//       const existing = (await readStore(key)) || {};
//       const payload = { ...existing, liked: !!nextLiked };
//       await AsyncStorage.setItem(key, JSON.stringify(payload));
//     } catch {}
//   }, [readStore]);

//   useEffect(() => {
//     let canceled = false;
//     (async () => {
//       if (!storageKey) { setLiked(false); return; }
//       const data = await readStore(storageKey);
//       if (!canceled) setLiked(!!data?.liked);
//     })();
//     return () => { canceled = true; };
//   }, [storageKey, readStore]);

//   const toggleLike = useCallback(async () => {
//     const next = !liked;
//     setLiked(next);
//     if (storageKey) await writeStore(storageKey, next);
//   }, [liked, storageKey, writeStore]);

//   // expose programmatic API
//   useImperativeHandle(ref, () => ({
//     toggleLike,
//     setLiked: (v) => setLiked(!!v),
//     getLiked: () => liked,
//   }), [toggleLike, liked]);

//   return (
//     <TouchableOpacity style={[styles.hit, style]} onPress={toggleLike} hitSlop={8}>
//       {liked ? <HeartFilled color="red" /> : <HeartOutline color="white" />}
//     </TouchableOpacity>
//   );
// }

// const LikeButton = forwardRef(LikeButtonImpl);
// export default LikeButton;

// const styles = StyleSheet.create({
//   hit: { padding: 8, alignItems: 'center', justifyContent: 'center' },
// });
