 import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

type Props = {
  children: ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return (
    <SafeAreaView 
    style={{ 
      flex: 1,
      // backgroundColor: '#0C2A42',
      backgroundColor: Colors.background,
      width: '100%'
     }} 
    edges={['top', 'bottom']}
    >
      {children}
    </SafeAreaView>
  );
}
