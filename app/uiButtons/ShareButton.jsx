import React, { useCallback } from 'react';
import { Alert, Platform, Share, StyleSheet, TouchableOpacity } from 'react-native';
import ShareIcon from '@/assets/icons/ShareIcon';

// --- Env & helpers ----------------------------------------------------------
const WEB_BASE = (process.env.EXPO_PUBLIC_WEB_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || '')
  .replace(/\/+$/, '');
const APP_SCHEME = ((process.env.EXPO_PUBLIC_APP_SCHEME || 'ubcfirstyearlifeapp') + '://'); // your scheme

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

/**
 * Props:
 *  mode="posts"        + { shortcode, ci? }
 *  mode="confessions"  + { ci, confession }   // ← only these two
 */
export default function ShareButton(props) {
  const onPress = useCallback(async () => {
    // support either props.ci or props.index
    const ci = Number.isFinite(props.ci)
      ? props.ci
      : (Number.isFinite(props.index) ? props.index : undefined);

    let urls;
    if (props.mode === 'posts') {
      if (!props.shortcode) {
        console.warn('[ShareButton] Missing shortcode for post share');
        return Alert.alert('Share unavailable', 'Missing shortcode for this post.');
      }
      urls = postUrls(props.shortcode, ci);
    } else {
      // derive from the confession object ONLY
      const c = props.confession || {};
      const residence = c.residence ?? c.Residence ?? c.res ?? '';
      // your data uses postID (capital D) — normalize to string
      const postId = String(c.postID ?? c.postId ?? c.post_id ?? c.id ?? '');

      if (!residence || !postId) {
        console.warn('[ShareButton] Missing group ids', { residence, postId, ci, confession: c });
        return Alert.alert('Share unavailable', 'Missing residence or postId for this confession.');
      }
      urls = confUrls(residence, postId, ci);
    }

    // preview text: prefer confession.content, then .text
    const text = trim(
      props.confession?.content ??
      props.confession?.text ??
      ''
    );

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
