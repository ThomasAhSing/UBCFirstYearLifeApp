// external imports
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from '@/context/DataContext';

// project imports
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

export default function RootLayout() {
  // const styles = getStyles()
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

  if (!fontsLoaded) {
    // Async font loading only occurs in development.
    return null;
  }


  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <DataProvider>
          <Stack >

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </DataProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
