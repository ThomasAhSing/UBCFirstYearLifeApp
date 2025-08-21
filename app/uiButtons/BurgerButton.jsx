// app/uiButtons/BurgerButton.jsx
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Burger from '@/assets/icons/Burger';

export default function BurgerButton({ style, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.hit, style]}
      hitSlop={8}
      onPress={onPress}
      accessibilityLabel="More options"
      accessibilityHint="Open actions like report"
    >
      <Burger color="white" size={28}/>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 8, alignItems: 'center', justifyContent: 'center' },
});
