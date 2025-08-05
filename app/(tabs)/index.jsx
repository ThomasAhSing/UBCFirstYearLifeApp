import { StyleSheet, View, Text } from 'react-native';
import { DataContext } from '@/context/DataContext';

import Heading from '../Heading';
import PostFlatList from '../HomeComponents/PostFlatList';
import ScreenWrapper from '../ScreenWrapper';
import { useContext } from 'react';

export default function HomeScreen() {


  const {postDataLoaded} = useContext(DataContext)

  if (!postDataLoaded) return (
    <ScreenWrapper>
        <Heading/>
        <Text style={{ color: "white" }}>Loading home...</Text>
    </ScreenWrapper>
  )

  return (
    <ScreenWrapper>
        <Heading/>
        <PostFlatList/>
    </ScreenWrapper>

  );
}

const styles = StyleSheet.create({
  
});
