import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


// icon imports 
import HomeFilled from '../../assets/icons/HomeFilled'
import HomeOutline from '../../assets/icons/HomeOutline'
import ConfessionFilled from '../../assets/icons/ConfessionsFld'
import ConfessionOutline from  '../../assets/icons/ConfessionsOtln'
import EventFilled from  '../../assets/icons/EventFilled'
import EventOutline from  '../../assets/icons/EventOutline'
import JumpStartFilled from  '../../assets/icons/JumpStartFilled'
import JumpStartOutline from  '../../assets/icons/JumpStartOutline'


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return <HomeFilled size={28} color="orange" />
            } else {
              return <HomeOutline size={28} color="orange" />
            }
          } 
        }}
      />
      <Tabs.Screen
        name="confessions"
        options={{
          title: 'Confessions',
          
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return <ConfessionFilled size={28} color="orange" />
            } else {
              return <ConfessionOutline size={28} color="orange" />
            }
          } 
          
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',// tabBarIcon: ({ color }) => <EventOutline size={28} color="orange" />,
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return <EventFilled size={28} color="orange" />
            } else {
              return  <EventOutline size={28} color="orange" />
            }
          } 
        }}
      />
      <Tabs.Screen
        name="jumpStart"
        options={{
          title: 'Jump Start',
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return <JumpStartFilled size={50} color="orange" />
            } else {
              return <JumpStartOutline size={50} color="orange" />;
            }
          } 
        }}
      />
    </Tabs>
  );
}
