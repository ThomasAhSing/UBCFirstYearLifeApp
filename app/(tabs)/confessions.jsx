// external imports
import { StyleSheet, Text } from 'react-native';
import { useState, useEffect, useContext } from 'react'
import { Colors } from '@/constants/Colors';

// project imports
import ScreenWrapper from "../ScreenWrapper";
import Heading from "@/app/Heading"
import ConfessionsOptionsBar from '../confessionComponents/ConfessionsOptionsBar';
import ConfessionsGrid from '../confessionComponents/ConfessionsGrid';
import { DataContext } from '@/context/DataContext';
import AnimateOpen from '@/app/AnimateOpen';

export default function ConfessionsScreen() {
  const {
    postedConfessionsDataLoaded,
    postedConfessionsDataLoading,
    loadAllPostedConfessions
  } = useContext(DataContext);

  const [selectedResidence, setSelectedResidence] = useState("TotemPark");

  // Always run hooks, no early returns before this
  useEffect(() => {
    if (!postedConfessionsDataLoaded && !postedConfessionsDataLoading) {
      loadAllPostedConfessions();
    }
  }, [postedConfessionsDataLoaded, postedConfessionsDataLoading, loadAllPostedConfessions]);


  // Single return; branch inside
  return (
    <AnimateOpen>
      <ScreenWrapper>
        {postedConfessionsDataLoading && (
          <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>
            Loading confessions...
          </Text>
        )}

        {!postedConfessionsDataLoading && !postedConfessionsDataLoaded && (
          <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>
            Failed to load confessions from server...
          </Text>
        )}

        {postedConfessionsDataLoaded && (
          <>
            <Heading />
            <ConfessionsOptionsBar
              style={styles.optionsBar}
              selectedResidence={selectedResidence}
              setSelectedResidence={setSelectedResidence}
            />
            <ConfessionsGrid
              selectedResidence={selectedResidence}
              setSelectedResidence={setSelectedResidence}
            />
          </>
        )}
      </ScreenWrapper>
    </AnimateOpen>
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
