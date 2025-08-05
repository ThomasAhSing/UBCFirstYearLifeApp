// external imports
import { StyleSheet, Text } from 'react-native';
import { useState } from 'react'

import { Colors } from '@/constants/Colors';



// TODO, add popup telling user what confessions is when they first open

// project imports
import ScreenWrapper from "../ScreenWrapper";
import Heading from "../Heading"
import ConfessionsOptionsBar from '../confessionComponents/ConfessionsOptionsBar';
import ConfessionsGrid from '../confessionComponents/ConfessionsGrid';
import { DataContext } from '@/context/DataContext';
import { useContext, useEffect } from 'react';


export default function ConfessionsScreen() {
  const {
    postedConfessionsDataLoaded,
    postedConfessionsDataLoading,
    loadAllPostedConfessions
  } = useContext(DataContext);

  const [selectedResidence, setSelectedResidence] = useState("TotemPark")

  useEffect(() => {
    if (!postedConfessionsDataLoaded && !postedConfessionsDataLoading) {
      loadAllPostedConfessions()
    }
  }, []);

  if (postedConfessionsDataLoading) {
    return <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>Loading confessions...</Text>;
  }

  if (!postedConfessionsDataLoaded) {
    return <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>Failed to load confessions from server...</Text>;
  }

  return (
    <ScreenWrapper>
      <Heading />
      <ConfessionsOptionsBar
        style={styles.optionsBar}
        selectedResidence={selectedResidence}
        setSelectedResidence={setSelectedResidence}
      />
      <ConfessionsGrid selectedResidence={selectedResidence} setSelectedResidence={setSelectedResidence} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    height: 50,
    width: 50,
    backgroundColor: Colors.goldAccent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
