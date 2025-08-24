// GiveawayScreen.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
// If you already have this in your app:
import { api } from '@/context/DataContext';

const COLORS = {
  bg: '#0C2A42',
  card: '#102F4B',
  text: '#FFFFFF',
  subtext: '#C6DAF3',
  border: '#173E63',
  gold: '#E6B800',
  white: '#FFFFFF',
};

function useCountdown(endsAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, new Date(endsAt).getTime() - now);
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

export default function GiveawayScreen({
  title = 'UBC First Year Life • Fall Giveaway',
  subtitle = 'Invite friends. Earn entries. Win campus prizes.',
  endsAt = '2025-09-20T23:59:59-07:00',
  totalEntries = 0,
  userEntries = 0,
  onEnter = () => {},
  onShare: onShareProp, // optional external handler
  bannerImage,
  winnersAnnounceText = 'Winners announced on Instagram @ubcfirstyearlife',
}) {
  const { ended, parts } = useCountdown(endsAt);

  // --- New state for referral registration ---
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const emailValid = useMemo(() => {
    // Simple validation; you can tighten this if you want.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const qrSrc = useMemo(() => {
    // Use Google Charts to avoid adding a library
    return shareUrl
      ? `https://chart.googleapis.com/chart?chs=512x512&cht=qr&chld=L|1&chl=${encodeURIComponent(shareUrl)}`
      : '';
  }, [shareUrl]);

  async function handleRegister() {
    setError('');
    if (!emailValid) {
      setEmailTouched(true);
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/referral/register', { email: email.trim().toLowerCase() });
      const { shareUrl: urlFromApi, code: codeFromApi } = res?.data || {};
      if (!urlFromApi) throw new Error('Missing shareUrl');
      setShareUrl(urlFromApi);
      setCode(codeFromApi || '');
    } catch (e) {
      console.error(e);
      setError('Could not generate your link. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (onShareProp) return onShareProp(shareUrl, code, email);
    if (!shareUrl) {
      Alert.alert('Create your link', 'Enter your email and tap “Get My Link” first.');
      return;
    }
    try {
      await Share.share({
        message: `Join the UBC First Year Life app! Use my link: ${shareUrl}`,
        url: shareUrl, // iOS uses this field too
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Banner */}
        <View style={styles.hero}>
          {bannerImage ? (
            <Image source={bannerImage} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroFallback}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>
            </View>
          )}
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
              <Text style={styles.endsAt}>Ends: {new Date(endsAt).toLocaleString()}</Text>
            </>
          ) : (
            <>
              <ClosedBadge />
              <Text style={[styles.endsAt, { marginTop: 8 }]}>{winnersAnnounceText}</Text>
            </>
          )}
        </View>

        {/* Entries */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your entries</Text>
          <View style={styles.entriesRow}>
            <Stat label="You" value={userEntries} />
            <Stat label="Total" value={totalEntries} />
          </View>

          {!ended ? (
            <>
              <Pressable onPress={onEnter} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
                <Text style={styles.ctaText}>Enter / Add Entry</Text>
              </Pressable>

              <Pressable onPress={handleShare} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}>
                <Text style={styles.secondaryText}>Share to earn +1 entry</Text>
              </Pressable>

              <Text style={styles.note}>
                Each friend who installs via your link or scans your QR adds +1 entry.
              </Text>
            </>
          ) : (
            <Text style={styles.note}>Thanks for participating! Keep an eye out for future events.</Text>
          )}
        </View>

        {/* NEW: Email → personal link & QR */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get your personal link</Text>

          <TextInput
            value={email}
            onChangeText={(t) => setEmail(t)}
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

          {/* Link + Share/Copy */}
          {!!shareUrl && (
            <>
              <View style={styles.linkRow}>
                <Text style={styles.linkLabel}>Your link</Text>
                <Text numberOfLines={1} style={styles.linkValue}>{shareUrl}</Text>
              </View>
              <View style={styles.row}>
                <Pressable onPress={handleShare} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, { flex: 1 }]}>
                  <Text style={styles.secondaryText}>Share Link</Text>
                </Pressable>
                <Pressable onPress={handleCopy} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed, { flex: 1 }]}>
                  <Text style={styles.secondaryText}>Copy Link</Text>
                </Pressable>
              </View>

              {/* QR */}
              <Text style={[styles.cardTitle, { marginTop: 16 }]}>Your QR code</Text>
              <View style={styles.qrWrap}>
                <Image
                  source={{ uri: qrSrc }}
                  style={{ width: 220, height: 220, borderRadius: 12 }}
                />
              </View>
              <Text style={styles.note}>Friends can scan this to download with your referral.</Text>
            </>
          )}
        </View>

        {/* Rules */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          <RuleItem text="1. Tap “Enter” to claim your first entry." />
          <RuleItem text="2. Share your referral link or QR code." />
          <RuleItem text="3. Each verified install via your link = +1 entry." />
          <RuleItem text="4. Winner(s) chosen randomly after the end date." />
          <Text style={styles.disclaimer}>
            By entering, you agree to the official rules and eligibility requirements.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Made with ❤️ for UBC First Years</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
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

function RuleItem({ text }) {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.bullet} />
      <Text style={styles.ruleText}>{text}</Text>
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
  heroImage: { width: '100%', height: 160 },
  heroFallback: { padding: 20, alignItems: 'center', gap: 8 },
  trophy: { fontSize: 48 },
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

  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gold, marginTop: 7 },
  ruleText: { color: COLORS.text, fontSize: 14, flex: 1 },

  disclaimer: { color: COLORS.subtext, fontSize: 12, marginTop: 8 },

  closedWrap: {
    backgroundColor: 'rgba(230,184,0,0.1)',
    borderColor: COLORS.gold,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  closedText: { color: COLORS.gold, fontWeight: '800', letterSpacing: 1 },

  footer: { color: COLORS.subtext, textAlign: 'center', marginTop: 4, fontSize: 12 },

  // --- New styles ---
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
});
