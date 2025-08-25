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
  Keyboard
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTime } from 'luxon';
import { api } from '@/context/DataContext';
import Heading from '@/app/Heading';

// Firebase Storage (banner image + info/rules text)
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/src/firebase';

// Info icon
import InfoOutline from '@/assets/icons/InfoOutline';

// Cross-platform QR (iOS/Android/Web)
import QRCode from 'react-native-qrcode-svg';
import AnimateOpen from '@/app/AnimateOpen';

const COLORS = {
  bg: '#0C2A42',
  card: '#102F4B',
  text: '#FFFFFF',
  subtext: '#C6DAF3',
  border: '#173E63',
  gold: '#E6B800',
  white: '#FFFFFF',
  dark_blue: "#062036",
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

// ---------- AsyncStorage helpers ----------
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

// ---- Local fallback for info/prizes ----
const LOCAL_INFO_FALLBACK = `1x Tshirt
1x flask bottle
1x Thunderbird pop socket`.trim();

// ---- Apple-required long rules fallback ----
const OFFICIAL_RULES_FALLBACK = `
Apple Disclaimer: Apple Inc. is not a sponsor of, does not endorse, and is not involved in this giveaway in any way.

This giveaway is organized by the First Year Life app team to promote the app.

Free Participation: Participation is 100% free. There is no payment, no in-app purchase, and no external purchase required to enter or to win. This giveaway is not a raffle, sweepstakes with paid entry, or any form of gambling.

Eligibility: Open to current UBC students and incoming first-year students. Must be 18+ years old (to match the app’s App Store age rating). Void where prohibited by law. By entering, participants agree to these rules.

How to Enter: Enter your email address in the app to receive one entry. Additional entries are earned if you share your referral link or QR code and someone else clicks / scans it. We will not send push notifications or unsolicited messages about this giveaway. Participation is entirely user-initiated.

Giveaway Period: Entries are accepted from 2025/08/25 to 2025/09/07. After the end date, the giveaway screen will clearly display a “Giveaway Ended” message, and no further entries will be counted. The screen will remain in the app for transparency, but will not appear broken or misleading once the giveaway is over.

Prizes: Items such as T-shirts, bottles, and accessories that were either personally purchased by the team or donated for free. No cash prizes will be awarded.

Winner Selection: Winners will be chosen at random from all valid entries after the giveaway ends. The draw will take place within 7 days after closing. Winners will be contacted only by email. If a winner does not respond within 7 days, another entrant may be selected.

Data/Privacy: Emails are collected solely to track entries and notify winners. They will not be shared, sold, or used for any other purpose. All collected emails will be deleted within 30 days after the giveaway ends.
`.trim();

export default function GiveawayScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { ended, parts } = useCountdown(GIVEAWAY_END_UTC);

  // Dismiss state for the end overlay (so users can navigate even after end)
  const [endedOverlayVisible, setEndedOverlayVisible] = useState(true);

  // Entries state
  const [youEntriesLocal, setYouEntriesLocal] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);

  // Referral state
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Banner state (image replaces trophy) + natural size for aspect ratio
  const [bannerUrl, setBannerUrl] = useState(null);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [bannerNatural, setBannerNatural] = useState({ w: 0, h: 0 });

  // Info/Prizes modal (Firebase-loaded text with local fallback)
  const [rulesVisible, setRulesVisible] = useState(false);
  const [rulesText, setRulesText] = useState(LOCAL_INFO_FALLBACK);

  // NEW: Official Rules modal
  const [legalVisible, setLegalVisible] = useState(false);

  // ---- Fetch info/prizes text once from Firebase Storage (fallback to LOCAL_INFO_FALLBACK) ----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const candidates = [
          'appImages/giveaway_details.txt',
          'appImages/giveaway_details.md',
          'appImages/giveaway_details.txt',
          'appImages/giveaway_details.md',
        ];
        for (const path of candidates) {
          try {
            const url = await getDownloadURL(ref(storage, path));
            const resp = await fetch(url, { cache: 'no-store' });
            const txt = await resp.text();
            if (alive && txt && txt.trim()) {
              setRulesText(txt.trim());
              break;
            }
          } catch {
            // try next
          }
        }
      } catch {
        // keep fallback
      }
    })();
    return () => { alive = false; };
  }, []);

  // ---- Fetch banner once (multi-ext) ----
  useEffect(() => {
    let alive = true;
    async function resolveBannerUrl() {
      const exts = ['jpg', 'jpeg', 'png', 'webp'];
      for (const ext of exts) {
        try {
          const url = await getDownloadURL(ref(storage, `appImages/Giveaway.${ext}`));
          if (!alive) return;
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

  // ---- On mount: restore from storage, then load entries + total ----
  useEffect(() => {
    let alive = true;
    (async () => {
      // Always get total entries, even if user has no email yet
      fetchTotalEntries();

      const { email: savedEmail, shareUrl: savedUrl, code: savedCode } = await loadReferralFromDevice();
      if (!alive) return;

      if (savedEmail) {
        setEmail(savedEmail);
        if (savedUrl) setShareUrl(savedUrl);
        if (savedCode) setCode(savedCode);

        // Get the user's entries using GET endpoint
        fetchYourEntries(savedEmail);
      }
    })();

    return () => { alive = false; };
  }, []);

  // ---- Helpers to call your GET endpoints ----
  async function fetchYourEntries(targetEmail) {
    const normalized = (targetEmail || '').trim().toLowerCase();
    if (!normalized) return;
    try {
      const res = await api.get(`/referral/entries/${encodeURIComponent(normalized)}`);
      const entries = res?.data?.entries;
      if (typeof entries === 'number') {
        setYouEntriesLocal((curr) => Math.max(curr, entries));
      }
    } catch (e) {
      if (e?.response?.status === 404) {
        setYouEntriesLocal(0);
        return;
      }
      console.log('fetchYourEntries error:', e?.message);
    }
  }

  async function fetchTotalEntries() {
    try {
      const res = await api.get('/referral/entries');
      const total = res?.data?.totalEntries;
      if (typeof total === 'number') setTotalEntries(total);
    } catch (e) {
      console.log('fetchTotalEntries error:', e?.message);
    }
  }

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim()),
    [email]
  );

  // ---- Register flow (optimistic 1; save only on success) ----
  async function handleRegister() {
    setError('');
    if (shareUrl) return; // already registered on this device (lock)
    if (!emailValid) { setEmailTouched(true); return; }

    const normalized = email.trim().toLowerCase();
    const hadEntries = youEntriesLocal > 0;

    try {
      setLoading(true);

      // Optimistic UX: user sees at least 1 entry immediately
      setYouEntriesLocal((n) => (n <= 0 ? 1 : n));

      const res = await api.post('/referral/register', { email: normalized });
      const { shareUrl: urlFromApi, code: codeFromApi } = res?.data || {};

      if (!urlFromApi) {
        // Treat as failure: revert optimistic bump (back to 0 if we had none)
        if (!hadEntries) setYouEntriesLocal(0);
        throw new Error('Missing shareUrl');
      }

      setShareUrl(urlFromApi);
      if (codeFromApi) setCode(codeFromApi);

      // Save ONLY on success
      await saveReferralToDevice({
        email: normalized,
        shareUrl: urlFromApi,
        code: codeFromApi || '',
      });

      // Reconcile entries from server (won't drop below 1 due to Math.max logic)
      fetchYourEntries(normalized);

      // Refresh total entries (optional but nice)
      fetchTotalEntries();
    } catch (e) {
      console.error(e);
      setError('Could not generate your link. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  async function handleShareLink() {
    if (!shareUrl) {
      Alert.alert('Create your link', 'Enter your email and tap “Get My Link” first.');
      return;
    }
    try {
      // Share API is a no-op on some web environments; still safe to call
      await Share.share({
        message: `Join the UBC First Year Life app! Use my link: ${shareUrl}`,
        url: shareUrl,
        title: 'UBC First Year Life',
      });
    } catch (e) {
      console.error(e);
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

  // Modal controls
  function openRulesModal() { setRulesVisible(true); }
  function closeRulesModal() { setRulesVisible(false); }

  // Display end time in Vancouver time
  const endsAtDisplay = useMemo(
    () =>
      DateTime.fromISO(GIVEAWAY_END_UTC, { zone: 'utc' })
        .setZone('America/Vancouver')
        .toFormat("cccc, LLL d, h:mm a 'PDT'"),
    []
  );

  // Dynamic image size (80% of screen width, original aspect ratio)
  const imgW = Math.round(screenWidth * 0.8);
  const imgH =
    bannerNatural.w > 0 ? Math.round((imgW * bannerNatural.h) / bannerNatural.w) : 0;

  return (
    <AnimateOpen>
      <SafeAreaView style={styles.safe}>
        <Heading />
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
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
                    {/* (Info button moved beside title per your layout) */}
                  </View>
                ) : (
                  <Text style={styles.trophy}>🏆</Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.heroTitle}>{TITLE}</Text>
                  <TouchableOpacity
                    onPress={openRulesModal}
                    activeOpacity={0.8}
                    style={styles.infoBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Open Giveaway Info"
                  >
                    <InfoOutline width={18} height={18} color={COLORS.gold} />
                  </TouchableOpacity>
                </View>

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

                  <View style={styles.legalRow}>
                    <Pressable onPress={() => setLegalVisible(true)} style={({ pressed }) => pressed && { opacity: 0.8 }}>
                      <Text style={styles.linkText}>Official Rules</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <ClosedBadge />
                  <Text style={[styles.endsAt, { marginTop: 8 }]}>{WINNERS_TEXT}</Text>
                  <View style={styles.legalRow}>
                    <Pressable onPress={() => setLegalVisible(true)} style={({ pressed }) => pressed && { opacity: 0.8 }}>
                      <Text style={styles.linkText}>Official Rules</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>

            {/* Entries (populated via GET endpoints) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your entries</Text>
              <View style={styles.entriesRow}>
                <Stat label="You" value={youEntriesLocal} />
                <Stat label="Total" value={totalEntries} />
              </View>
              <Text style={styles.note}>
                Earn more entries when friends scan your QR code or click your custom link. Refresh the app to see new entries.
              </Text>
            </View>

            {/* Email → personal link & QR */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Get your personal link</Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                editable={!shareUrl}                               // 🔒 lock after link is created
                onBlur={() => setEmailTouched(true)}
                placeholder="your.email@ubc.ca"
                placeholderTextColor="#89A9C6"
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, shareUrl && { opacity: 0.6 }]} // dim when locked
              />
              {!!(emailTouched && !emailValid) && (
                <Text style={styles.inputError}>Please enter a valid email.</Text>
              )}

              <Text style={styles.helper}>
                This email is used only for the giveaway (entries & winner contact). It is <Text style={{ fontWeight: '700', color: COLORS.white }}>not</Text> used for anonymous confessions.
              </Text>

              <Pressable
                onPress={handleRegister}
                disabled={!emailValid || loading || !!shareUrl}      // ⛔️ disable after link exists
                style={({ pressed }) => [
                  styles.cta,
                  (!emailValid || loading || !!shareUrl) && { opacity: 0.6 },
                  pressed && styles.ctaPressed,
                ]}
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Generating…' : shareUrl ? 'Link Created' : 'Get My Link'}
                </Text>
              </Pressable>

              {!!error && <Text style={[styles.inputError, { marginTop: 8 }]}>{error}</Text>}

              {!!shareUrl && (
                <>
                  <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>Your link</Text>
                    <Text numberOfLines={1} style={styles.linkValue}>{shareUrl}</Text>
                  </View>
                  <View style={styles.row}>
                    <Pressable
                      onPress={handleShareLink}
                      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, { flex: 1 }]}
                    >
                      <Text style={styles.secondaryText}>Share Link</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleCopy}
                      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, { flex: 1 }]}
                    >
                      <Text style={styles.secondaryText}>Copy Link</Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.cardTitle, { marginTop: 16 }]}>Your QR code</Text>
                  <Text style={styles.footer}>Share this QR code to earn more entries!</Text>
                  <View style={styles.qrWrap}>
                    {/* Local QR that renders on iOS/Android/Web */}
                    <QRCode
                      value={shareUrl}
                      size={220}
                      backgroundColor="transparent"
                      color={COLORS.white}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Footer + Apple disclaimer */}
            <Text style={[styles.footer, {marginTop: 5}]}>Download First Year Life for the full first year experience</Text>
            <Text style={styles.appleDisclaimer}>
              Apple Inc. is not a sponsor, nor affiliated with, nor responsible for this giveaway.
            </Text>
            <View style={{ height: 24 }} />
          </Pressable>
        </ScrollView>

        {/* End overlay (dismissible) */}
        {ended && endedOverlayVisible && (
          <EndedOverlay
            winnersAnnounceText={WINNERS_TEXT}
            onClose={() => setEndedOverlayVisible(false)}
          />
        )}

        {/* Info / Prizes Modal */}
        <Modal
          visible={rulesVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setRulesVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Giveaway Prizes</Text>
                <Pressable onPress={() => setRulesVisible(false)} style={({ pressed }) => pressed && { opacity: 0.6 }}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>
              <ScrollView style={{ maxHeight: 420 }}>
                <Text style={styles.rulesText}>{rulesText}</Text>
                <Text style={[styles.appleDisclaimer, { marginTop: 12 }]}>
                  Apple Inc. is not a sponsor, nor affiliated with, nor responsible for this giveaway.
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Official Rules Modal */}
        <Modal
          visible={legalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setLegalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Official Rules</Text>
                <Pressable onPress={() => setLegalVisible(false)} style={({ pressed }) => pressed && { opacity: 0.6 }}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>
              <ScrollView style={{ maxHeight: 420 }}>
                <Text style={styles.rulesText}>{OFFICIAL_RULES_FALLBACK}</Text>
                <Text style={[styles.appleDisclaimer, { marginTop: 12 }]}>
                  Apple Inc. is not a sponsor, nor affiliated with, nor responsible for this giveaway.
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AnimateOpen>
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

function EndedOverlay({ winnersAnnounceText, onClose }) {
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
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%' }}>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.overlayCloseBtn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.overlayCloseIcon}>✕</Text>
          </Pressable>
        </View>
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

  trophy: { fontSize: 48 },

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
    padding: 5,
    marginLeft: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(230,184,0,0.5)',
  },

  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
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
    backgroundColor: 'rgba(6, 32, 54, 0.9)',
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '86%',
  },
  overlayTitle: { color: COLORS.gold, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  overlaySub: { color: COLORS.subtext, fontSize: 13, textAlign: 'center' },

  // Close button INSIDE overlay card header
  overlayCloseBtn: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(230,184,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  overlayCloseIcon: { color: COLORS.gold, fontSize: 16, fontWeight: '800' },

  confetti: { position: 'absolute', fontSize: 22 },

  footer: { color: COLORS.subtext, textAlign: 'center', marginTop: 4, marginBottom: 10, fontSize: 14 },
  appleDisclaimer: {
    color: COLORS.subtext,
    textAlign: 'center',
    fontSize: 10,
    marginTop: 16,
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
    backgroundColor: COLORS.dark_blue,
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

  closedWrap: {
    backgroundColor: 'rgba(230,184,0,0.1)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closedText: { color: COLORS.gold, fontWeight: '800' },
});
