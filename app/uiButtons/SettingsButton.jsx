// components/SettingsButton.jsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import SettingOutline from '@/assets/icons/SettingOutline';

export default function SettingsButton({
  style,
  href = '/screens/SettingsScreen',
  color = 'white',
  size = 22,
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push(href)}
      style={[{ paddingHorizontal: 10, height: 44, justifyContent: 'center' }, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      activeOpacity={0.6}
    >
      <SettingOutline color={color} width={size} height={size} />
    </TouchableOpacity>
  );
}
