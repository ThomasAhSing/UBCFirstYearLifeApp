import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearModerationStore() {
  try {
    await AsyncStorage.clear();
    console.log('✅ All AsyncStorage cleared');
  } catch (err) {
    console.error('❌ Failed to clear AsyncStorage', err);
  }
}
// clearModerationStore()


// 🔑 Keys (exported for debugging/tools if you want)
export const KEY_HIDDEN_POST_SHORTCODES = 'hidden_post_shortcodes_v1';   // curated posts
export const KEY_HIDDEN_CONF_POSTIDS    = 'hidden_conf_postids_v1';      // confessions groups
export const KEY_BLOCKED_POST_USERS     = 'blocked_post_usernames_v1';   // curated accounts (userFetchedFrom)
export const KEY_BLOCKED_CONF_AUTHORS   = 'blocked_conf_author_ids_v1';  // confessions authors (submittedFrom/authorHandle)

// ---------- internal helpers ----------
async function loadList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn(`[moderationStore] failed to parse list for ${key}`, e);
    return [];
  }
}
async function saveList(key, list) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list || []));
  } catch (e) {
    console.warn(`[moderationStore] failed to save list for ${key}`, e);
  }
}
async function addToSet(key, value) {
  const v = String(value ?? '');
  if (!v) return;
  const list = await loadList(key);
  if (!list.includes(v)) {
    list.push(v);
    await saveList(key, list);
  }
}
async function removeFromSet(key, value) {
  const v = String(value ?? '');
  if (!v) return;
  const list = await loadList(key);
  const next = list.filter(x => x !== v);
  if (next.length !== list.length) await saveList(key, next);
}

// ---------- public add/block/hide ----------
export const hidePostShortcode  = (shortcode) => addToSet(KEY_HIDDEN_POST_SHORTCODES, String(shortcode ?? ''));
export const hideConfPostId     = (postId)    => addToSet(KEY_HIDDEN_CONF_POSTIDS,    String(postId ?? ''));
export const blockPostUser      = (username)  => addToSet(KEY_BLOCKED_POST_USERS,     String(username ?? ''));
export const blockConfAuthor    = (authorId)  => addToSet(KEY_BLOCKED_CONF_AUTHORS,   String(authorId ?? ''));

// ---------- public remove/unblock (nice for Settings/undo/debug) ----------
export const unhidePostShortcode = (shortcode) => removeFromSet(KEY_HIDDEN_POST_SHORTCODES, String(shortcode ?? ''));
export const unhideConfPostId    = (postId)    => removeFromSet(KEY_HIDDEN_CONF_POSTIDS,    String(postId ?? ''));
export const unblockPostUser     = (username)  => removeFromSet(KEY_BLOCKED_POST_USERS,     String(username ?? ''));
export const unblockConfAuthor   = (authorId)  => removeFromSet(KEY_BLOCKED_CONF_AUTHORS,   String(authorId ?? ''));

// ---------- loaders (for screens to filter) ----------
export const loadHiddenPostShortcodes = () => loadList(KEY_HIDDEN_POST_SHORTCODES);
export const loadHiddenConfPostIds    = () => loadList(KEY_HIDDEN_CONF_POSTIDS);
export const loadBlockedPostUsers     = () => loadList(KEY_BLOCKED_POST_USERS);
export const loadBlockedConfAuthors   = () => loadList(KEY_BLOCKED_CONF_AUTHORS);

// ---------- targeted clears (avoid AsyncStorage.clear) ----------
export async function clearModerationLists() {
  // only clears moderation keys; safe to expose in Settings/Dev
  await Promise.all([
    AsyncStorage.removeItem(KEY_HIDDEN_POST_SHORTCODES),
    AsyncStorage.removeItem(KEY_HIDDEN_CONF_POSTIDS),
    AsyncStorage.removeItem(KEY_BLOCKED_POST_USERS),
    AsyncStorage.removeItem(KEY_BLOCKED_CONF_AUTHORS),
  ]);
}