import React, { useCallback } from 'react';
import { Alert, Platform, Share, StyleSheet, TouchableOpacity } from 'react-native';
import ShareIcon from '@/assets/icons/ShareIcon';

// --- Env & helpers ----------------------------------------------------------
const WEB_BASE = (process.env.EXPO_PUBLIC_WEB_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || '')
  .replace(/\/+$/, '');
const APP_SCHEME = ((process.env.EXPO_PUBLIC_APP_SCHEME || 'ubcfirstyearlifeapp') + '://');

const enc  = (s) => encodeURIComponent(String(s ?? ''));
const trim = (s, n = 140) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};
const q = (ci) => (Number.isFinite(ci) ? `?ci=${ci}` : '');

const postUrls = (shortcode, ci) => ({
  deep: `${APP_SCHEME}post/${enc(shortcode)}${q(ci)}`,
  web : `${WEB_BASE}/p/${enc(shortcode)}${q(ci)}`,
});
const confUrls = (residence, postId, ci) => ({
  deep: `${APP_SCHEME}cg/${enc(residence)}/${enc(postId)}${q(ci)}`,
  web : `${WEB_BASE}/cg/${enc(residence)}/${enc(postId)}${q(ci)}`,
});

// normalize ids/content from a confession object
const getConfessionBasics = (c = {}) => ({
  residence: c.residence ?? c.Residence ?? c.res ?? '',
  postId: String(c.postID ?? c.postId ?? c.post_id ?? c.id ?? ''),
  content: c.content ?? c.text ?? '',
  submittedAt: c.submittedAt ?? c.createdAt ?? ''
});

/**
 * Props:
 *  mode="posts"        + { shortcode, ci?, preview? }
 *  mode="confessions"  + { confessions: Confession[], ci?: number }
 */
export default function ShareButton(props) {
  const onPress = useCallback(async () => {
    const ci = Number.isFinite(props.ci)
      ? props.ci
      : (Number.isFinite(props.index) ? props.index : 0);

    let urls, text = '';

    if (props.mode === 'posts') {
      if (!props.shortcode) {
        console.warn('[ShareButton] Missing shortcode for post share');
        return Alert.alert('Share unavailable', 'Missing shortcode for this post.');
      }
      urls = postUrls(props.shortcode, ci);
      text = trim(props.preview || '');
    } else {
      const list = Array.isArray(props.confessions) ? props.confessions : [];
      if (list.length === 0) {
        console.warn('[ShareButton] Empty confession list');
        return Alert.alert('Share unavailable', 'No confessions to share.');
      }

      const { residence, postId } = getConfessionBasics(list[0]);
      if (!residence || !postId) {
        console.warn('[ShareButton] Missing group ids', { residence, postId });
        return Alert.alert('Share unavailable', 'Missing residence or postId for this confession group.');
      }

      const sel = list[Math.min(Math.max(ci, 0), list.length - 1)] || list[0];
      const { content } = getConfessionBasics(sel);

      urls = confUrls(residence, postId, ci);
      text = trim(content);

      // Pack minimal data so the web page can render RN-like slides
      const cards = list.map(c => {
        const b = getConfessionBasics(c);
        return { content: String(b.content || ''), submittedAt: b.submittedAt || '' };
      });

      const extras = new URLSearchParams();
      extras.set('len', String(list.length));
      extras.set('cards', JSON.stringify(cards));

      // (Optional) include short preview text
      // extras.set('pv', text);

      urls.web += (urls.web.includes('?') ? '&' : '?') + extras.toString();
    }

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'UBC First Year Life', text, url: urls.web });
        return;
      }

      await Share.share(
        Platform.select({
          ios:     { message: text, url: urls.web },
          android: { message: `${text}\n\nOpen in app:\n${urls.deep}\nWeb: ${urls.web}` },
          default: { message: `${text}\n${urls.web}` },
        }),
        Platform.select({
          android: { dialogTitle: 'Share' },
          ios:     { subject: 'UBC First Year Life' },
          default: {},
        })
      );
    } catch (e) {
      Alert.alert('Share failed', e?.message || 'Please try again.');
    }
  }, [props]);

  return (
    <TouchableOpacity style={[styles.hit, props.style]} onPress={onPress} hitSlop={8}>
      <ShareIcon color="white" size={28} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 8, alignItems: 'center', justifyContent: 'center' },
});
