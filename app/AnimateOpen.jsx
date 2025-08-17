import React, { useRef, useCallback } from 'react';
import { Animated, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function AnimateOpen({
  children,
  duration = 150,
  from = 0,
  to = 1,
  style,
  backgroundColor = '#0C2A42', // your deep blue
}) {
  const opacity = useRef(new Animated.Value(from)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(from);
      const anim = Animated.timing(opacity, {
        toValue: to,
        duration,
        useNativeDriver: true,
      });
      anim.start();
      return () => anim.stop();
    }, [opacity, from, to, duration])
  );

  // Non-animated container holds the bg color
  return (
    <View style={[{ flex: 1, backgroundColor }, style]}>
      <Animated.View style={{ flex: 1, opacity }}>
        {children}
      </Animated.View>
    </View>
  );
}
