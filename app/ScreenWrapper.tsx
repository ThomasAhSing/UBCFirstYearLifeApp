import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
type Props = {
  children: ReactNode;
  bgColor?: string;
};

export default function ScreenWrapper({ children, bgColor }: Props) {
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: bgColor || Colors.background,
        width: '100%',
        paddingBottom: tabBarHeight
      }}
      edges={['top']}
    >
      {children}
    </SafeAreaView>
  );
}
