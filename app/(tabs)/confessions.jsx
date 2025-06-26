// external imports
import { Image } from 'expo-image';
import { Platform, StyleSheet, Text } from 'react-native';

// project imports
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ScreenWrapper from "../ScreenWrapper"

export default function ConfessionsScreen() {
  return (
    <ScreenWrapper>
      <Text style={{color: 'white'}}>Confessions</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  
});
