// app/lib/notifications.js
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

import { API_BASE } from '@/lib/config';

function getProjectId() {
  // Works in dev build or EAS build; Expo Go usually lacks this
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    null
  );
}

function runningInUnsupportedEnv() {
  // Expo Go or Simulator can’t receive push; token fetch may be unavailable
  const isExpoGo = Constants.appOwnership === 'expo';
  const isIosSim = Platform.OS === 'ios' && !Application.applicationId; // crude sim hint
  return { isExpoGo, isIosSim };
}

export async function getPermissionGranted() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function requestPermissionOrSettings() {
  let { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && canAskAgain) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') {
    Alert.alert('Notifications are off', 'Enable them in Settings to get 7pm drops.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings?.() },
    ]);
    return false;
  }
  return true;
}

export async function enablePushAsync(apiBase = API_BASE) {
  // 0) Quick sanity checks
  if (!apiBase) {
    console.warn('API_BASE is undefined — set EXPO_PUBLIC_EXPO_PUBLIC_API_BASE_URL');
    return { ok: false, reason: 'no-api-base' };
  }

  const ok = await requestPermissionOrSettings();
  if (!ok) return { ok: false, reason: 'denied' };

  // 1) Environment support (Expo Go / Simulator)
  const { isExpoGo, isIosSim } = runningInUnsupportedEnv();
  if (isExpoGo || isIosSim) {
    Alert.alert(
      'Unsupported in this build',
      isExpoGo
        ? 'Push notifications don’t work in Expo Go. Build a development client (EAS Dev Build) or a production build.'
        : 'iOS Simulator cannot receive push notifications. Use a physical device with a dev/prod build.'
    );
    // Keep local flag false; don’t pretend we’re subscribed
    await AsyncStorage.setItem('pushSubscribed', 'false');
    return { ok: false, reason: isExpoGo ? 'expo-go' : 'simulator' };
  }

  // 2) Token with projectId (required on recent SDKs)
  const projectId = getProjectId();
  if (!projectId) {
    console.warn('Missing projectId in app config (expo.extra.eas.projectId).');
    return { ok: false, reason: 'no-project-id' };
  }

  let token;
  try {
    const res = await Notifications.getExpoPushTokenAsync({ projectId });
    token = res.data;
  } catch (e) {
    console.warn('Failed to get Expo push token', e);
    return { ok: false, reason: 'token-failed' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // 3) Register on server — only persist locally if server accepts
  try {
    await axios.post(`${apiBase}/push/register`, {
      token,
      subscribe: true,
      platform: Platform.OS,
      deviceId:
        Platform.OS === 'android'
          ? Application.androidId || 'unknown'
          : (Application.getIosIdForVendorAsync
              ? await Application.getIosIdForVendorAsync()
              : 'unknown'),
    });
  } catch (e) {
    console.warn('Server register failed', e?.response?.data || e.message);
    // Don’t cache success locally
    await AsyncStorage.setItem('pushSubscribed', 'false');
    return { ok: false, reason: 'server-failed' };
  }

  // Success → persist
  await AsyncStorage.setItem('expoPushToken', token);
  await AsyncStorage.setItem('pushSubscribed', 'true');

  return { ok: true, token };
}

export async function unsubscribePushAsync(apiBase = API_BASE) {
  const token = await AsyncStorage.getItem('expoPushToken');
  try {
    if (token && apiBase) {
      await axios.post(`${apiBase}/push/register`, {
        token,
        subscribe: false,
        platform: Platform.OS,
      });
    }
  } catch (e) {
    console.warn('Server unsubscribe failed', e?.response?.data || e.message);
    // still proceed to mark local off
  }
  await AsyncStorage.setItem('pushSubscribed', 'false');
  return { ok: true };
}

export async function ensureRegistered(apiBase = API_BASE) {
  const granted = await getPermissionGranted();
  if (!granted) {
    // Permission revoked at OS → reflect locally
    await AsyncStorage.setItem('pushSubscribed', 'false');
    return { ok: false, reason: 'no-permission' };
  }

  const token = await AsyncStorage.getItem('expoPushToken');
  const localSub = (await AsyncStorage.getItem('pushSubscribed')) !== 'false';

  const { isExpoGo, isIosSim } = runningInUnsupportedEnv();
  if (isExpoGo || isIosSim) {
    // Don’t try to re-register in unsupported envs
    return { ok: false, reason: isExpoGo ? 'expo-go' : 'simulator' };
  }

  if (!token) return enablePushAsync(apiBase); // silently obtains & registers

  try {
    await axios.post(`${apiBase}/push/register`, {
      token,
      subscribe: localSub,
      platform: Platform.OS,
    });
    return { ok: true, token };
  } catch (e) {
    console.warn('ensureRegistered failed', e?.response?.data || e.message);
    return { ok: false, reason: 'server-failed' };
  }
}
