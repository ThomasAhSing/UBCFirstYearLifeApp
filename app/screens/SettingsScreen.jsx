// screens/Settings.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Switch,
    TouchableOpacity,
    Linking,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { enablePushAsync, unsubscribePushAsync, ensureRegistered } from '../lib/notifications';

import { Colors } from '@/constants/Colors';
import BackIcon from '@/assets/icons/BackIcon';

const EXPO_PUBLIC_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


console.log("EXPO_PUBLIC_API_BASE_URL")
console.log(EXPO_PUBLIC_API_BASE_URL)

const ACCENT = '#3B82F6'; // blue accent (ok to swap for a gold shade if you prefer)

export default function SettingsScreen() {
    const router = useRouter();

    const [permGranted, setPermGranted] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    // Header styling with custom BackIcon
    // (Expo Router: define options inside the component)
    const HeaderLeft = () => (
        <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingHorizontal: 12, height: 44, justifyContent: 'center' }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.6}
        >
            <BackIcon color="white" width={22} height={22} />
        </TouchableOpacity>
    );

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { status } = await Notifications.getPermissionsAsync();
                if (!mounted) return;
                setPermGranted(status === 'granted');

                const sub = await AsyncStorage.getItem('pushSubscribed');
                if (!mounted) return;
                setSubscribed(sub !== 'false'); // default true if unknown

                if (status === 'granted') {
                    await ensureRegistered(EXPO_PUBLIC_API_BASE_URL); // silent re-register
                }
            } catch (e) {
                console.warn('Settings init failed', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const onToggle = async (next) => {
        if (loading) return;
        setLoading(true);
        try {
            if (next) {
                const res = await enablePushAsync(EXPO_PUBLIC_API_BASE_URL);
                if (res.ok) {
                    setPermGranted(true);
                    setSubscribed(true);
                } else {
                    // keep them off
                    const grantedNow = await getPermissionGranted(); // reflect real OS state
                    setPermGranted(grantedNow);
                    setSubscribed(false);

                    let msg = 'Could not enable notifications.';
                    if (res.reason === 'expo-go') msg = 'Push is not supported in Expo Go.';
                    if (res.reason === 'simulator') msg = 'Simulators cannot receive push notifications.';
                    if (res.reason === 'no-project-id') msg = 'Missing projectId in app config.';
                    if (res.reason === 'no-api-base') msg = 'App API base URL is not set.';
                    Alert.alert('Notifications', msg);
                }
            } else {
                await unsubscribePushAsync(EXPO_PUBLIC_API_BASE_URL);
                setSubscribed(false);
            }
        } finally {
            setLoading(false);
        }
    };


    const openSystemSettings = () => {
        if (Linking.openSettings) Linking.openSettings();
        else Alert.alert('Open settings', 'Enable notifications in your device settings.');
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <Stack.Screen
                options={{
                    title: 'Settings',
                    headerStyle: { backgroundColor: Colors.background },
                    headerTintColor: 'white',
                    headerTitleStyle: { color: 'white' },
                    headerLeft: HeaderLeft,
                }}
            />

            <View style={{ padding: 16, gap: 20 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: 'white' }}>Settings</Text>

                {/* Notifications card */}
                <View
                    style={{
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.15)',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                            Don't miss out on new confessions
                        </Text>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Switch
                                value={permGranted && subscribed}
                                onValueChange={onToggle}
                                trackColor={{ false: 'rgba(255,255,255,0.25)', true: ACCENT }}
                                thumbColor="white"
                                ios_backgroundColor="rgba(255,255,255,0.25)"
                            />
                        )}
                    </View>

                    {!permGranted && (
                        <View style={{ marginTop: 12 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 10 }}>
                                Turn this on to get notified when new confessions drop.
                            </Text>
                            <TouchableOpacity
                                onPress={openSystemSettings}
                                activeOpacity={0.8}
                                style={{
                                    alignSelf: 'flex-start',
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    borderRadius: 10,
                                    backgroundColor: 'rgba(59,130,246,0.18)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(59,130,246,0.4)',
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>Open Phone Settings</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {permGranted && (
                        <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                            {subscribed
                                ? 'Notifications enabled. You can turn this off anytime.'
                                : 'Permission granted, but you’re unsubscribed on the server.'}
                        </Text>
                    )}
                </View>

                {/* About */}
                <View style={{ opacity: 0.95 }}>
                    <Text style={{ fontWeight: '600', marginBottom: 6, color: 'white' }}>About</Text>
                    <Text style={{ color: 'white' }}>UBC First Year Life</Text>
                    <Text style={{ color: 'white' }}>For Students. By Students.</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                        Version {Application.nativeApplicationVersion || '1.0.0'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
