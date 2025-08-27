import { StyleSheet, View, Text } from 'react-native';
import { DataContext } from '@/context/DataContext';

import Heading from '../Heading';
import PostFlatList from '../HomeComponents/PostFlatList';
import ScreenWrapper from '../ScreenWrapper';
import { useContext } from 'react';
import AnimateOpen from '@/app/AnimateOpen';

export default function HomeScreen() {


  const { postDataLoaded } = useContext(DataContext)

  if (!postDataLoaded) return (
    <ScreenWrapper>
      <Heading title="home"/>
      <Text style={{ color: "white" }}>Loading home...</Text>
    </ScreenWrapper>
  )

  return (
    <AnimateOpen>
      <ScreenWrapper>
        <Heading title="home" />
        <PostFlatList style={{flex: 1}}/>
      </ScreenWrapper>
    </AnimateOpen>

  );
}

const styles = StyleSheet.create({

});
