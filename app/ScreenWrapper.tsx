import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

type Props = {
  children: ReactNode;
  bgColor?: string;
};

export default function ScreenWrapper({ children, bgColor }: Props) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: bgColor || Colors.background,
        width: '100%'
      }}
      edges={['top', 'bottom']}
    >
      {children}
    </SafeAreaView>
  );
}
