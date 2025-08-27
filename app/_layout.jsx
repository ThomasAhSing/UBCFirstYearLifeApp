// external imports
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from '@/context/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

// NEW: storage + modal
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeModal from '@/app/screens/WelcomeEULA';

const TOS_KEY = 'tosAccepted_v1'; // bump to _v2 when Terms change

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    InterRegular: require('../assets/fonts/Inter_18pt-Regular.ttf'),
    InterMedium: require('../assets/fonts/Inter_18pt-Medium.ttf'),
    InterSemiBold: require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
    RobotoRegular: require('../assets/fonts/Roboto-Regular.ttf'),
    RobotoItalic: require('../assets/fonts/Roboto-Italic.ttf'),
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf'),
    CourgetteRegular: require('../assets/fonts/Courgette-Regular.ttf'),
  });

  const [ready, setReady] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem(TOS_KEY);
        setNeedsConsent(val !== '1');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!fontsLoaded || !ready) {
    return null; // or splash
  }

  const handleAgree = async () => {
    await AsyncStorage.setItem(TOS_KEY, '1');
    setNeedsConsent(false);
  };

  return (
    <SafeAreaProvider>
      {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
      <ThemeProvider value={DarkTheme}>
        <DataProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </DataProvider>

        {/* EULA / Welcome gate */}
        <WelcomeModal visible={needsConsent} onAgree={handleAgree} />

        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
