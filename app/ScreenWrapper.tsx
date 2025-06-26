import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return (
    <SafeAreaView 
    style={{ 
      flex: 1,
      backgroundColor: '#0C2A42'
     }} 
    edges={['top', 'bottom']}
    >
      {children}
    </SafeAreaView>
  );
}
