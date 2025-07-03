// external imports
import { StyleSheet, Text } from 'react-native';
import { useState } from 'react'



// TODO, add popup telling user what confessions is when they first open

// project imports
import ScreenWrapper from "../ScreenWrapper";
import Heading from "../Heading"
import ConfessionsOptionsBar from '../confessionComponents/ConfessionsOptionsBar';
import ConfessionsGrid from '../confessionComponents/ConfessionsGrid';
import AllConfessionsScroller from '../confessionComponents/AllConfessionsScroller'

export const confessionImageMap = {
  "Totem Park": {
    1: require('@/data/confessions/previewImages/totem_park_cid1_pid1.png'),
    2: require('@/data/confessions/previewImages/totem_park_cid6_pid2.png'),
    3: require('@/data/confessions/previewImages/totem_park_cid11_pid3.png'),
    4: require('@/data/confessions/previewImages/totem_park_cid16_pid4.png'),
    5: require('@/data/confessions/previewImages/totem_park_cid55_pid5.png'),
  },
  "Orchard Commons": {
    1: require('@/data/confessions/previewImages/orchard_commons_cid21_pid1.png'),
    2: require('@/data/confessions/previewImages/orchard_commons_cid26_pid2.png'),
    3: require('@/data/confessions/previewImages/orchard_commons_cid31_pid3.png'),
    4: require('@/data/confessions/previewImages/orchard_commons_cid36_pid4.png'),
    5: require('@/data/confessions/previewImages/orchard_commons_cid57_pid5.png'),
  },
  "Place Vanier": {
    1: require('@/data/confessions/previewImages/place_vanier_cid41_pid1.png'),
    2: require('@/data/confessions/previewImages/place_vanier_cid46_pid2.png'),
    3: require('@/data/confessions/previewImages/place_vanier_cid51_pid3.png'),
    4: require('@/data/confessions/previewImages/place_vanier_cid59_pid4.png'),
  },
};


export default function ConfessionsScreen() {
  const [selectedResidence, setSelectedResidence] = useState("Totem Park")
  const [allConfessionsScrollerVisible, setAllConfessionsScrollerVisible] = useState(false)

  return (
    <ScreenWrapper>
      <Heading/>
      <ConfessionsOptionsBar selectedResidence={selectedResidence} setSelectedResidence={setSelectedResidence}/>
      <Text style={{color: 'white'}}>Confessions</Text>
      
      <ConfessionsGrid selectedResidence={selectedResidence} setSelectedResidence={setSelectedResidence}/>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  
});
