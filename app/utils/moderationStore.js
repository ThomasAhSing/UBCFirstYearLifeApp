// utils/moderationStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const KEY_HIDDEN_POST_SHORTCODES = 'hidden_post_shortcodes_v1';       // for curated posts
const KEY_HIDDEN_CONF_POSTIDS    = 'hidden_conf_postids_v1';          // hide a whole confessions post
const KEY_BLOCKED_POST_USERS     = 'blocked_post_usernames_v1';       // block curated account (userFetchedFrom)
const KEY_BLOCKED_CONF_AUTHORS   = 'blocked_conf_author_ids_v1';      // block confession author (submittedFrom/authorHandle)

// internal helpers
async function loadList(key) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
async function saveList(key, list) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}
async function addToSet(key, value) {
  const v = String(value || '');
  if (!v) return;
  const list = await loadList(key);
  if (!list.includes(v)) {
    list.push(v);
    await saveList(key, list);
  }
}

// public API
export async function hidePostShortcode(shortcode) {
  await addToSet(KEY_HIDDEN_POST_SHORTCODES, shortcode);
}
export async function hideConfPostId(postId) {
  await addToSet(KEY_HIDDEN_CONF_POSTIDS, postId);
}
export async function blockPostUser(username) {
  await addToSet(KEY_BLOCKED_POST_USERS, username);
}
export async function blockConfAuthor(authorId) {
  await addToSet(KEY_BLOCKED_CONF_AUTHORS, authorId);
}

// (optional) loaders for your screens to filter feeds at render time:
export const loadHiddenPostShortcodes = () => loadList(KEY_HIDDEN_POST_SHORTCODES);
export const loadHiddenConfPostIds    = () => loadList(KEY_HIDDEN_CONF_POSTIDS);
export const loadBlockedPostUsers     = () => loadList(KEY_BLOCKED_POST_USERS);
export const loadBlockedConfAuthors   = () => loadList(KEY_BLOCKED_CONF_AUTHORS);
