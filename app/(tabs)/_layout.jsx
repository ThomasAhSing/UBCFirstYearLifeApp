// external imports
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, FlatList } from 'react-native';

// project import 
import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
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
  const styles = getStyles()
  const colorScheme = useColorScheme();
  const iconColor = "white"
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            height: 80,
            backgroundColor: 'transparent',
          },
          default: {
            position: 'absolute',
            height: 80,
            backgroundColor: 'transparent',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return <HomeFilled size={28} color={iconColor} />
            } else {
              return <HomeOutline size={28} color={iconColor} />
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
              return <ConfessionFilled size={28} color={iconColor} />
            } else {
              return <ConfessionOutline size={28} color={iconColor} />
            }
          } 
          
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return <EventFilled size={28} color={iconColor} />
            } else {
              return  <EventOutline size={28} color={iconColor} />
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
              return <JumpStartFilled size={50} color={iconColor} />
            } else {
              return <JumpStartOutline size={50} color={iconColor} />;
            }
          } 
        }}
      />
    </Tabs>
  );
}


function getStyles() {
  return StyleSheet.create(
    {
      
    }
  )
}
