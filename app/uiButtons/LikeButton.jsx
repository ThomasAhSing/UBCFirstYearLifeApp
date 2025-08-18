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