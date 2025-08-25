// GiveawayScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
  TextInput,
  Share,
  Alert,
  Animated,
  Easing,
  useWindowDimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTime } from 'luxon';
import { api } from '@/context/DataContext';

// Firebase Storage (for the banner image only)
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/src/firebase';

// Info icon component
import InfoOutline from '@/assets/icons/InfoOutline';

const COLORS = {
  bg: '#0C2A42',
  card: '#102F4B',
  text: '#FFFFFF',
  subtext: '#C6DAF3',
  border: '#173E63',
  gold: '#E6B800',
  white: '#FFFFFF',
};

const TITLE = 'First Year Life • Fall Giveaway';
const SUBTITLE = 'Invite friends. Earn entries. Win prizes.';
const WINNERS_TEXT = 'Winners have been emailed';

// Sept 7, 2025 23:59 Vancouver == 2025-09-08T06:59:00Z (can override via env)
const GIVEAWAY_END_UTC =
  process.env.EXPO_PUBLIC_GIVEAWAY_END_UTC || '2025-09-08T06:59:00Z';

const STORAGE_EMAIL = 'giveaway_email';
const STORAGE_SHARE_URL = 'giveaway_share_url';
const STORAGE_CODE = 'giveaway_code';

// ——— Helpers for local state persistence ———
async function saveReferralToDevice({ email, shareUrl, code }) {
  try {
    if (email !== undefined) await AsyncStorage.setItem(STORAGE_EMAIL, email || '');
    if (shareUrl !== undefined) await AsyncStorage.setItem(STORAGE_SHARE_URL, shareUrl || '');
    if (code !== undefined) await AsyncStorage.setItem(STORAGE_CODE, code || '');
  } catch (e) {
    console.log('Failed to save referral data', e);
  }
}
async function loadReferralFromDevice() {
  try {
    const [email, shareUrl, code] = await Promise.all([
      AsyncStorage.getItem(STORAGE_EMAIL),
      AsyncStorage.getItem(STORAGE_SHARE_URL),
      AsyncStorage.getItem(STORAGE_CODE),
    ]);
    return { email, shareUrl, code };
  } catch (e) {
    console.log('Failed to load referral data', e);
    return {};
  }
}
async function clearReferralFromDevice() {
  try {
    await AsyncStorage.multiRemove([STORAGE_EMAIL, STORAGE_SHARE_URL, STORAGE_CODE]);
  } catch (e) {
    console.log('Failed to clear referral data', e);
  }
}

function useCountdown(endsAtISO) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const endMs = useMemo(() => new Date(endsAtISO).getTime(), [endsAtISO]);
  const diff = Math.max(0, endMs - now);
  const ended = diff <= 0;
  const parts = useMemo(() => {
    let remain = diff / 1000;
    const days = Math.floor(remain / 86400); remain -= days * 86400;
    const hours = Math.floor(remain / 3600); remain -= hours * 3600;
    const minutes = Math.floor(remain / 60); remain -= minutes * 60;
    const seconds = Math.floor(remain);
    return { days, hours, minutes, seconds };
  }, [diff]);
  return { ended, parts };
}

// Simple, static rules text (editable here; no network fetch)
const RULES_TEXT = `
OFFICIAL RULES

NO PURCHASE NECESSARY. VOID WHERE PROHIBITED.

Sponsor: UBC First Year Life (“Sponsor”).

Eligibility: Open to eligible participants as described by Sponsor (e.g., student status, age, residency). Employees/contractors of Sponsor and their immediate family/household members are not eligible.

How to Enter: Follow in-app instructions. Entries may include using a personal referral link as described. Automated/bulk entries prohibited.

Entry Period: Begins upon in-app announcement and ends at the date/time displayed in the countdown. Entries outside this period are void.

Prizes & ARV: See in-app communications for prize descriptions. Prizes are non-transferable; substitutions at Sponsor’s sole discretion.

Odds: Depend on the number of eligible entries received.

Winner Selection & Notification: Random drawing after the Entry Period ends. Potential winners notified via the email provided and may need to respond/complete verification within a stated time or forfeit.

General Conditions: Sponsor may disqualify any entry that tampers with the giveaway or violates these Rules. Sponsor may cancel/suspend/modify if fraud or other causes impair integrity.

Release: By participating, entrants release Sponsor and affiliates from claims arising from participation or use of any prize.

Publicity: Except where prohibited, participation constitutes consent for Sponsor to use entrant’s name/likeness for promotional purposes without additional compensation.

Platform Disclaimer: Apple Inc. is not a sponsor, administrator, or affiliated with this giveaway.

Privacy: Information is used only to administer the giveaway and contact winners, as described in the app.

Sponsor Contact: See in-app Sponsor contact information.
`.trim();

export default function GiveawayScreen() {
  const { width: screenWidth } = useWindowDimensions();

  const [youEntriesLocal, setYouEntriesLocal] = useState(0);
  const [totalEntries] = useState(0);
  const { ended, parts } = useCountdown(GIVEAWAY_END_UTC);

  // Referral registration state
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Banner (image replacing the trophy) + natural size for aspect ratio
  const [bannerUrl, setBannerUrl] = useState(null);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [bannerNatural, setBannerNatural] = useState({ w: 0, h: 0 });

  // Rules modal
  const [rulesVisible, setRulesVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    async function resolveBannerUrl() {
      const exts = ['jpg', 'jpeg', 'png', 'webp'];
      for (const ext of exts) {
        try {
          const url = await getDownloadURL(ref(storage, `appImages/Giveaway.${ext}`));
          if (!alive) return;
          // get natural size to preserve aspect ratio
          Image.getSize(
            url,
            (w, h) => {
              if (!alive) return;
              setBannerNatural({ w, h });
              setBannerUrl(url);
              setBannerFailed(false);
            },
            () => {
              if (!alive) return;
              // If size lookup fails, still show image with a safe default ratio (16:9)
              setBannerNatural({ w: 16, h: 9 });
              setBannerUrl(url);
              setBannerFailed(false);
            }
          );
          return; // success
        } catch {
          // try next extension
        }
      }
      if (alive) setBannerFailed(true);
    }
    resolveBannerUrl();
    return () => { alive = false; };
  }, []);

  // Load saved email/link/code on mount and refresh entries
  useEffect(() => {
    (async () => {
      const { email: savedEmail, shareUrl: savedUrl, code: savedCode } = await loadReferralFromDevice();
      if (savedEmail) setEmail(savedEmail);
      if (savedUrl) setShareUrl(savedUrl);
      if (savedCode) setCode(savedCode);

      if (savedEmail) {
        try {
          const res = await api.post('/referral/register', { email: savedEmail });
          const { shareUrl: u, code: c, entries } = res?.data || {};
          if (u) setShareUrl(u);
          if (c) setCode(c);
          if (typeof entries === 'number') setYouEntriesLocal(entries);
        } catch (e) {
          console.log('Refresh entries failed', e?.message);
        }
      }
    })();
  }, []);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim()),
    [email]
  );

  const qrSrc = useMemo(() => {
    return shareUrl
      ? `https://chart.googleapis.com/chart?chs=512x512&cht=qr&chld=L|1&chl=${encodeURIComponent(shareUrl)}`
      : '';
  }, [shareUrl]);

  async function handleRegister() {
    setError('');
    if (!emailValid) { setEmailTouched(true); return; }
    try {
      setLoading(true);
      const normalized = email.trim().toLowerCase();
      const res = await api.post('/referral/register', { email: normalized });
      const { shareUrl: urlFromApi, code: codeFromApi, entries } = res?.data || {};
      if (!urlFromApi) throw new Error('Missing shareUrl');

      setShareUrl(urlFromApi);
      setCode(codeFromApi || '');

      const newEntries =
        typeof entries === 'number'
          ? entries
          : (youEntriesLocal <= 0 ? 1 : youEntriesLocal);
      setYouEntriesLocal(newEntries);

      await saveReferralToDevice({ email: normalized, shareUrl: urlFromApi, code: codeFromApi });
    } catch (e) {
      console.error(e);
      setError('Could not generate your link. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) {
      Alert.alert('Create your link', 'Enter your email and tap “Get My Link” first.');
      return;
    }
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Copied', 'Your personal link has been copied to the clipboard.');
  }

  // Open Rules modal
  function openRulesModal() {
    setRulesVisible(true);
  }

  // Display end time in Vancouver time
  const endsAtDisplay = useMemo(
    () =>
      DateTime.fromISO(GIVEAWAY_END_UTC, { zone: 'utc' })
        .setZone('America/Vancouver')
        .toFormat("cccc, LLL d, h:mm a 'PDT'"),
    []
  );

  // Dynamic image size (80% of screen width, preserve natural aspect)
  const imgW = Math.round(screenWidth * 0.8);
  const imgH =
    bannerNatural.w > 0 ? Math.round((imgW * bannerNatural.h) / bannerNatural.w) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero (image replaces trophy only; title/subtitle remain visible) */}
        <View style={styles.hero}>
          <View style={styles.heroFallback}>
            {!bannerFailed && bannerUrl ? (
              <View style={styles.heroImageWrap}>
                <Image
                  source={{ uri: bannerUrl }}
                  style={[styles.heroDynamicImage, { width: imgW, height: imgH || 120 }]}
                  resizeMode="cover"
                  onError={() => setBannerFailed(true)}
                />
                {/* Info icon (opens Official Rules modal) */}
                <TouchableOpacity
                  onPress={openRulesModal}
                  activeOpacity={0.8}
                  style={styles.infoBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Open Official Rules"
                >
                  {/* Adjust props based on your icon component API */}
                  <InfoOutline width={18} height={18} color={COLORS.gold} />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.trophy}>🏆</Text>
            )}
            <Text style={styles.heroTitle}>{TITLE}</Text>
            <Text style={styles.heroSubtitle}>{SUBTITLE}</Text>
          </View>
        </View>

        {/* Countdown / Closed */}
        <View style={styles.card}>
          {!ended ? (
            <>
              <Text style={styles.cardTitle}>Time left</Text>
              <View style={styles.countdownRow}>
                <TimeChip label="Days" value={parts.days} />
                <TimeChip label="Hours" value={parts.hours} />
                <TimeChip label="Min" value={parts.minutes} />
                <TimeChip label="Sec" value={parts.seconds} />
              </View>
              <Text style={styles.endsAt}>Ends: {endsAtDisplay}</Text>

              {/* Official Rules text link also opens modal */}
              <View style={styles.legalRow}>
                <Pressable onPress={openRulesModal} style={({ pressed }) => pressed && { opacity: 0.8 }}>
                  <Text style={styles.linkText}>Official Rules</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <ClosedBadge />
              <Text style={[styles.endsAt, { marginTop: 8 }]}>{WINNERS_TEXT}</Text>
              <View style={styles.legalRow}>
                <Pressable onPress={openRulesModal} style={({ pressed }) => pressed && { opacity: 0.8 }}>
                  <Text style={styles.linkText}>Official Rules</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Entries (no action buttons) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your entries</Text>
          <View style={styles.entriesRow}>
            <Stat label="You" value={youEntriesLocal} />
            <Stat label="Total" value={totalEntries} />
          </View>
          <Text style={styles.note}>
            Entries update automatically as friends join using your link.
          </Text>
        </View>

        {/* Email → personal link & QR */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get your personal link</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            onBlur={() => setEmailTouched(true)}
            placeholder="your.email@ubc.ca"
            placeholderTextColor="#89A9C6"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          {!!(emailTouched && !emailValid) && (
            <Text style={styles.inputError}>Please enter a valid email.</Text>
          )}

          <Text style={styles.helper}>
            This email is used only for the giveaway (entries & winner contact).
            It is <Text style={{ fontWeight: '700', color: COLORS.white }}>not</Text> used for anonymous confessions.
          </Text>

          <Pressable
            onPress={handleRegister}
            disabled={!emailValid || loading}
            style={({ pressed }) => [
              styles.cta,
              (!emailValid || loading) && { opacity: 0.6 },
              pressed && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaText}>{loading ? 'Generating…' : 'Get My Link'}</Text>
          </Pressable>

          {!!error && <Text style={[styles.inputError, { marginTop: 8 }]}>{error}</Text>}

          {!!shareUrl && (
            <>
              <View style={styles.linkRow}>
                <Text style={styles.linkLabel}>Your link</Text>
                <Text numberOfLines={1} style={styles.linkValue}>{shareUrl}</Text>
              </View>
              <View style={styles.row}>
                <Pressable onPress={async () => {
                  try {
                    await Share.share({
                      message: `Join the UBC First Year Life app! Use my link: ${shareUrl}`,
                      url: shareUrl,
                      title: 'UBC First Year Life',
                    });
                  } catch (e) { console.error(e); }
                }} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, { flex: 1 }]}>
                  <Text style={styles.secondaryText}>Share Link</Text>
                </Pressable>
                <Pressable onPress={handleCopy} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, { flex: 1 }]}>
                  <Text style={styles.secondaryText}>Copy Link</Text>
                </Pressable>
              </View>

              <Text style={[styles.cardTitle, { marginTop: 16 }]}>Your QR code</Text>
              <View style={styles.qrWrap}>
                <Image
                  source={{ uri: shareUrl ? `https://chart.googleapis.com/chart?chs=512x512&cht=qr&chld=L|1&chl=${encodeURIComponent(shareUrl)}` : undefined }}
                  style={{ width: 220, height: 220, borderRadius: 12 }}
                />
              </View>

              <Pressable
                onPress={async () => {
                  await clearReferralFromDevice();
                  setEmail(''); setShareUrl(''); setCode(''); setYouEntriesLocal(0);
                  Alert.alert('Reset', 'Saved giveaway email and link cleared. Enter a new email to start again.');
                }}
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, { marginTop: 8 }]}
              >
                <Text style={styles.secondaryText}>Reset saved email</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Footer + Apple disclaimer */}
        <Text style={styles.footer}>Made with ❤️ for UBC First Years</Text>
        <Text style={styles.appleDisclaimer}>
          Apple Inc. is not a sponsor, nor affiliated with, nor responsible for this giveaway.
        </Text>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* End overlay */}
      {ended && <EndedOverlay winnersAnnounceText={WINNERS_TEXT} />}

      {/* Official Rules Modal (simple, no network) */}
      <Modal
        visible={rulesVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRulesVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Official Rules</Text>
              <Pressable onPress={() => setRulesVisible(false)} style={({ pressed }) => pressed && { opacity: 0.6 }}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.rulesText}>{RULES_TEXT}</Text>
              <Text style={[styles.appleDisclaimer, { marginTop: 12 }]}>
                Apple Inc. is not a sponsor, nor affiliated with, nor responsible for this giveaway.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TimeChip({ label, value }) {
  const vv = String(value).padStart(2, '0');
  return (
    <View style={styles.chip}>
      <Text style={styles.chipValue}>{vv}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ClosedBadge() {
  return (
    <View style={styles.closedWrap}>
      <Text style={styles.closedText}>GIVEAWAY CLOSED</Text>
    </View>
  );
}

function EndedOverlay({ winnersAnnounceText }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const [particles] = useState(() => {
    const EMOJIS = ['🎉', '🎊', '✨', '💫', '🎈', '🥳'];
    return new Array(24).fill(0).map((_, i) => ({
      key: `p-${i}`,
      emoji: EMOJIS[i % EMOJIS.length],
      startX: Math.random() * width * 0.9 + width * 0.05,
      delay: Math.random() * 500,
      duration: 2500 + Math.random() * 1200,
    }));
  });

  const anims = useRef(particles.map(() => new Animated.Value(-60))).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const animations = anims.map((v, idx) =>
      Animated.timing(v, {
        toValue: height + 40,
        duration: particles[idx].duration,
        delay: particles[idx].delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    );
    Animated.stagger(60, animations).start();
  }, [opacity, anims, particles, height]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      {particles.map((p, i) => (
        <Animated.Text
          key={p.key}
          style={[
            styles.confetti,
            {
              transform: [
                { translateY: anims[i] },
                { translateX: Math.sin(i * 12) * 8 },
                { rotate: `${(i * 37) % 360}deg` },
              ],
              left: p.startX,
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}

      <View style={styles.overlayCard}>
        <Text style={styles.overlayTitle}>Giveaway Ended</Text>
        <Text style={styles.overlaySub}>{winnersAnnounceText}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, gap: 16 },

  hero: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  heroFallback: { padding: 20, alignItems: 'center', gap: 8 },

  // Trophy size stays the same
  trophy: { fontSize: 48 },

  // Dynamic banner image wrapper (positions the info icon)
  heroImageWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDynamicImage: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  infoBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(230,184,0,0.5)',
  },

  heroTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  heroSubtitle: { color: COLORS.subtext, fontSize: 14, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 16, marginBottom: 10 },

  countdownRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  chip: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipValue: { color: COLORS.gold, fontSize: 24, fontWeight: '800' },
  chipLabel: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
  endsAt: { color: COLORS.subtext, fontSize: 12, marginTop: 10 },

  legalRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    color: COLORS.gold,
    textDecorationLine: 'underline',
    fontWeight: '700',
    fontSize: 12,
  },

  entriesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { color: COLORS.white, fontSize: 22, fontWeight: '800' },
  statLabel: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },

  cta: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaPressed: { opacity: 0.9 },
  ctaText: { color: '#1B1B1B', fontWeight: '800', fontSize: 16 },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnPressed: { opacity: 0.9 },
  secondaryText: { color: COLORS.gold, fontWeight: '700' },

  note: { color: COLORS.subtext, fontSize: 12, marginTop: 10 },

  input: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.white,
    marginBottom: 8,
  },
  inputError: { color: '#FFB4B4', fontSize: 12, marginTop: 2 },
  helper: { color: COLORS.subtext, fontSize: 12, marginBottom: 10 },

  linkRow: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  linkLabel: { color: COLORS.subtext, fontSize: 12, marginBottom: 6 },
  linkValue: { color: COLORS.white, fontSize: 13 },

  row: { flexDirection: 'row', gap: 10 },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // End overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 42, 66, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    backgroundColor: 'rgba(16, 47, 75, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  overlayTitle: { color: COLORS.gold, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  overlaySub: { color: COLORS.subtext, fontSize: 13, textAlign: 'center' },

  confetti: {
    position: 'absolute',
    fontSize: 22,
  },

  footer: { color: COLORS.subtext, textAlign: 'center', marginTop: 4, fontSize: 12 },
  appleDisclaimer: {
    color: COLORS.subtext,
    textAlign: 'center',
    fontSize: 10,
    marginTop: 6,
    opacity: 0.9,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 42, 66, 0.72)',
    padding: 16,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  modalClose: { color: COLORS.subtext, fontSize: 18, paddingHorizontal: 8, paddingVertical: 4 },
  rulesText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
});
