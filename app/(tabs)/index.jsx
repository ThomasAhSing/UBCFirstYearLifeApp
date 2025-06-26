import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ScreenWrapper from '../ScreenWrapper';
import Heading from '../Heading'

export default function HomeScreen() {
  return (
    <ScreenWrapper>
        <Heading/>
        <Text style={{color: 'white'}}>Home Screen</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  
});
