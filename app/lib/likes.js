import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Key helpers ---
export function keyForPost(post) {
  const sc = String(post?.shortcode ?? '').trim();
  return sc || '';
}

export function keyForConfession(cand) {
  const c = cand || {};
  const residence = String(c.residence ?? c.Residence ?? c.res ?? '').trim();
  const postId   = String(c.postID ?? c.postId ?? c.post_id ?? c.id ?? '').trim();
  return residence && postId ? `conf:${residence}:${postId}` : '';
}

// --- Storage helpers ---
async function readObj(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getLikedByKey(key) {
  if (!key) return false;
  const obj = await readObj(key);
  return !!obj?.liked;
}

export async function setLikedByKey(key, liked) {
  if (!key) return false;
  const existing = (await readObj(key)) || {};
  const payload = { ...existing, liked: !!liked };
  await AsyncStorage.setItem(key, JSON.stringify(payload));
  likesEvents.emit({ key, liked: !!liked });
  return !!liked;
}

export async function toggleLikedByKey(key) {
  const cur = await getLikedByKey(key);
  return setLikedByKey(key, !cur);
}

// --- Event bus ---
const subs = new Set();
export const likesEvents = {
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  emit(payload) { subs.forEach(fn => fn(payload)); },
};
