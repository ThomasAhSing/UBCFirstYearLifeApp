// app/confessionScreens/ConfessionsScreen.jsx
import { StyleSheet, Text } from 'react-native';
import { useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '@/constants/Colors';

// project imports
import ScreenWrapper from '../ScreenWrapper';
import Heading from '@/app/Heading';
import ConfessionsOptionsBar from '../confessionComponents/ConfessionsOptionsBar';
import ConfessionsGrid from '../confessionComponents/ConfessionsGrid';
import { DataContext } from '@/context/DataContext';
import AnimateOpen from '@/app/AnimateOpen';

import {
  enablePushAsync,
  ensureRegistered,
  getPermissionGranted,
} from '@/lib/notifications';
import { API_BASE } from '@/lib/config';
import PushOptInModal from '@/app/screens/PushOptInModal';

// NEW: first-visit intro modal
import ConfessionFirstVisitModal from '../confessionComponents/ConfessionFirstVisitModal';

// ------------------------------
// Local counters & keys
// ------------------------------
const COUNT_KEY = 'visit_confessions_qualified_count';
const LAST_FOCUS_KEY = 'visit_confessions_last_focus_at';
const NUDGED_KEY = 'confessions_notif_nudged';
const PUSH_SUB_KEY = 'pushSubscribed';
const INTRO_KEY = 'onboarding_confessions_v1'; // bump to v2 when you want to reshow

export default function ConfessionsScreen() {
  const {
    postedConfessionsDataLoaded,
    postedConfessionsDataLoading,
    loadAllPostedConfessions,
  } = useContext(DataContext);

  const [selectedResidence, setSelectedResidence] = useState('TotemPark');
  const [screen, setScreen] = useState('preview');
  const [startIndex, setStartIndex] = useState(0);

  // first-visit intro modal
  const [showIntro, setShowIntro] = useState(false);

  // nudge modal state
  const [showNudge, setShowNudge] = useState(false);
  const [enabling, setEnabling] = useState(false);

  // fetch confessions (your existing behavior)
  useEffect(() => {
    if (!postedConfessionsDataLoaded && !postedConfessionsDataLoading) {
      loadAllPostedConfessions();
    }
  }, [
    postedConfessionsDataLoaded,
    postedConfessionsDataLoading,
    loadAllPostedConfessions,
  ]);

  // Show FIRST-VISIT intro when screen first focuses
  const checkIntro = useCallback(async () => {
    try {
      const seen = await AsyncStorage.getItem(INTRO_KEY);
      if (seen !== '1') {
        setShowIntro(true);
        await AsyncStorage.setItem(INTRO_KEY, '1');
      }
    } catch (e) {
      // fail-safe: don't block if storage fails
      setShowIntro(true);
    }
  }, []);

  // Visit tracking + nudge logic (third visit)
  const maybeShowNudge = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(COUNT_KEY);
      const count = Math.max(0, parseInt(raw || '0', 10)) + 1;
      await AsyncStorage.setItem(COUNT_KEY, String(count));
      await AsyncStorage.setItem(LAST_FOCUS_KEY, String(Date.now()));

      const nudgedAlready = (await AsyncStorage.getItem(NUDGED_KEY)) === 'true';
      if (nudgedAlready) return;

      const permGranted = await getPermissionGranted();

      // If permission already granted, keep server in sync and skip
      if (permGranted) {
        await ensureRegistered(API_BASE);
        return;
      }

      // Permission NOT granted → show on 3rd visit
      if (count >= 3) {
        setShowNudge(true);
        await AsyncStorage.setItem(NUDGED_KEY, 'true');
        await AsyncStorage.setItem(PUSH_SUB_KEY, 'false');
      }
    } catch (e) {
      console.warn('nudge check failed', e);
    }
  }, []);

  // Run when screen gains focus
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!cancelled) {
          // Order: show intro first (if needed), then handle nudge counter
          await checkIntro();
          await maybeShowNudge();
        }
      })();
      return () => { cancelled = true; };
    }, [checkIntro, maybeShowNudge])
  );

  // Handlers for push nudge modal
  const handleEnablePush = useCallback(async () => {
    setEnabling(true);
    try {
      const res = await enablePushAsync(API_BASE);
      if (res.ok) {
        setShowNudge(false);
      } else {
        // helper already alerts user why it failed
      }
    } finally {
      setEnabling(false);
    }
  }, []);

  const handleCloseNudge = useCallback(() => {
    setShowNudge(false);
  }, []);

  // Handlers for first-visit intro
  const handleCloseIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  // If you have a route/screen to start composing, wire it here.
  // Otherwise you can set your internal state to switch screens.
  const handleStartPost = useCallback(() => {
    setShowIntro(false);
    // Example options—pick what your app uses:
    // 1) Navigate to a specific route:
    // router.push('/confessions/new');
    // 2) Flip to a compose state in the same screen:
    setScreen('compose'); // <- replace with whatever your Confessions flow expects
  }, []);

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <AnimateOpen>
      <ScreenWrapper>
        {postedConfessionsDataLoading && (
          <Text
            style={{
              paddingTop: 50,
              paddingLeft: 50,
              flex: 1,
              color: 'white',
              backgroundColor: Colors.background,
            }}
          >
            Loading confessions...
          </Text>
        )}

        {!postedConfessionsDataLoading && !postedConfessionsDataLoaded && (
          <Text
            style={{
              paddingTop: 50,
              paddingLeft: 50,
              flex: 1,
              color: 'white',
              backgroundColor: Colors.background,
            }}
          >
            Failed to load confessions from server...
          </Text>
        )}

        {postedConfessionsDataLoaded && (
          <>
            <Heading title="confessions" />
            <ConfessionsOptionsBar
              style={styles.optionsBar}
              selectedResidence={selectedResidence}
              setSelectedResidence={setSelectedResidence}
              setScreen={setScreen}
              setStartIndex={setStartIndex}
            />
            <ConfessionsGrid
              selectedResidence={selectedResidence}
              setSelectedResidence={setSelectedResidence}
              screen={screen}
              setScreen={setScreen}
              startIndex={startIndex}
              setStartIndex={setStartIndex}
            />
          </>
        )}

        {/* First-visit intro modal */}
        <ConfessionFirstVisitModal
          visible={showIntro}
          onClose={handleCloseIntro}
        />

        {/* Push nudge modal (third visit) */}
        <PushOptInModal
          visible={showNudge}
          loading={enabling}
          onEnable={handleEnablePush}
          onClose={handleCloseNudge}
        />
      </ScreenWrapper>
    </AnimateOpen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    height: 50,
    width: 50,
    backgroundColor: Colors.goldAccent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
