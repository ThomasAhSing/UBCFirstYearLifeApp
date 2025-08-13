// app/uiButtons/ShareButton.jsx
import React, { useCallback } from 'react';
import { Alert, Platform, Share, StyleSheet, TouchableOpacity } from 'react-native';
import ShareIcon from '@/assets/icons/ShareIcon';

// --- Env & helpers ----------------------------------------------------------
const WEB_BASE = (process.env.EXPO_PUBLIC_WEB_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || '')
  .replace(/\/+$/, ''); // strip trailing slash
const APP_SCHEME = ((process.env.EXPO_PUBLIC_APP_SCHEME || 'ubcfirstyear') + '://');

const enc = (s) => encodeURIComponent(String(s ?? ''));
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
 *  mode="posts"        + { shortcode, ci?, content?, confession? }
 *  mode="confessions"  + { residence, postId, ci, content?, confession? }
 *
 * Notes:
 * - iOS: Share prefers the URL field (renders rich preview from your OG tags).
 * - Android: Share uses the message body; we include both deep link + web link.
 * - Web (if rendered): uses the Web Share API when available.
 */
export default function ShareButton(props) {
  const onPress = useCallback(async () => {
    // be flexible if caller passed `index` instead of `ci`
    const ci = Number.isFinite(props.ci) ? props.ci : (Number.isFinite(props.index) ? props.index : undefined);

    // Build URLs
    const urls = props.mode === 'posts'
      ? postUrls(props.shortcode, ci)
      : confUrls(props.residence, props.postId, ci);

    // Compose share text (prefer explicit content, else current confession text)
    const text = trim(props.content || props.confession?.text || '');

    try {
      // Web PWA support
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'UBC First Year Life', text, url: urls.web });
        return;
      }

      // Native share
      await Share.share(
        Platform.select({
          ios:     { message: text, url: urls.web }, // iOS shows link preview
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
