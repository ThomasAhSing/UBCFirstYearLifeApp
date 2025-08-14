import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeartOutline from '@/assets/icons/HeartOutline';
import HeartFilled from '@/assets/icons/HeartFilled';

/**
 * Props:
 *   mode: 'posts' | 'confessions'
 *   // posts:
 *   post?: { shortcode?: string }
 *   // confessions:
 *   confession?: object
 *   confessions?: object[]   // if provided, first item used to derive residence/postID
 *   style?: any
 *
 * Storage:
 *   posts -> key = post.shortcode
 *   confessions -> key = `conf:${residence}:${postId}`
 *   value shape kept as { liked: boolean, bookmarked?: boolean }
 */
export default function LikeButton(props) {
  const { mode = 'posts', post, confession, confessions, style } = props;

  // choose one confession object if in confessions mode
  const pickConf = () => {
    if (confession && typeof confession === 'object') return confession;
    if (Array.isArray(confessions) && confessions.length) return confessions[0];
    return null;
  };

  // derive storage key
  const storageKey = useMemo(() => {
    if (mode === 'posts') {
      const sc = String(post?.shortcode ?? '').trim();
      return sc; // legacy posts key (shared with SaveButton)
    }
    // confessions group key
    const c = pickConf() || {};
    const residence = String(c.residence ?? c.Residence ?? c.res ?? '').trim();
    const postId = String(c.postID ?? c.postId ?? c.post_id ?? c.id ?? '').trim();
    return residence && postId ? `conf:${residence}:${postId}` : '';
  }, [mode, post, confession, confessions]);

  const [liked, setLiked] = useState(false);

  const readStore = useCallback(async (key) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const writeStore = useCallback(async (key, nextLiked) => {
    try {
      const existing = (await readStore(key)) || {};
      const payload = { ...existing, liked: !!nextLiked };
      await AsyncStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [readStore]);

  // load liked state on mount / key change
  useEffect(() => {
    let canceled = false;
    (async () => {
      if (!storageKey) {
        setLiked(false);
        return;
      }
      const data = await readStore(storageKey);
      if (!canceled) setLiked(!!data?.liked);
    })();
    return () => { canceled = true; };
  }, [storageKey, readStore]);

  const onPress = useCallback(async () => {
    const next = !liked;
    setLiked(next);
    if (storageKey) await writeStore(storageKey, next);
  }, [liked, storageKey, writeStore]);

  return (
    <TouchableOpacity style={[styles.hit, style]} onPress={onPress} hitSlop={8}>
      {liked ? <HeartFilled color="red" /> : <HeartOutline color="white" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 8, alignItems: 'center', justifyContent: 'center' },
});
