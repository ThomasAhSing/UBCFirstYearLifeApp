// external imports
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react'

import { Colors } from '@/constants/Colors';



// TODO, add popup telling user what confessions is when they first open

// project imports
import ScreenWrapper from "../ScreenWrapper";
import Heading from "../Heading"
import ConfessionsOptionsBar from '../confessionComponents/ConfessionsOptionsBar';
import ConfessionsGrid from '../confessionComponents/ConfessionsGrid';
import AllConfessionsScroller from '../confessionComponents/AllConfessionsScroller'
import PlusIcon from '@/assets/icons/PlusIcon'

export const confessionImageMap = {
  "TotemPark": {
    1: require('@/data/confessions/previewImages/totem_park_cid1_pid1.png'),
    2: require('@/data/confessions/previewImages/totem_park_cid6_pid2.png'),
    3: require('@/data/confessions/previewImages/totem_park_cid11_pid3.png'),
    4: require('@/data/confessions/previewImages/totem_park_cid16_pid4.png'),
    5: require('@/data/confessions/previewImages/totem_park_cid55_pid5.png'),
  },
  "OrchardCommons": {
    1: require('@/data/confessions/previewImages/orchard_commons_cid21_pid1.png'),
    2: require('@/data/confessions/previewImages/orchard_commons_cid26_pid2.png'),
    3: require('@/data/confessions/previewImages/orchard_commons_cid31_pid3.png'),
    4: require('@/data/confessions/previewImages/orchard_commons_cid36_pid4.png'),
    5: require('@/data/confessions/previewImages/orchard_commons_cid57_pid5.png'),
  },
  "PlaceVanier": {
    1: require('@/data/confessions/previewImages/place_vanier_cid41_pid1.png'),
    2: require('@/data/confessions/previewImages/place_vanier_cid46_pid2.png'),
    3: require('@/data/confessions/previewImages/place_vanier_cid51_pid3.png'),
    4: require('@/data/confessions/previewImages/place_vanier_cid59_pid4.png'),
  },
};


export default function ConfessionsScreen() {
  const [selectedResidence, setSelectedResidence] = useState("TotemPark")
  const [allConfessionsScrollerVisible, setAllConfessionsScrollerVisible] = useState(false)

  return (
    <ScreenWrapper>
      <Heading/>
      <ConfessionsOptionsBar 
      style={styles.optionsBar}
      selectedResidence={selectedResidence} 
      setSelectedResidence={setSelectedResidence}
      />
      {/* <TouchableOpacity style={styles.addButton}>
        <PlusIcon size={30} color='white'/>
      </TouchableOpacity> */}
      <ConfessionsGrid selectedResidence={selectedResidence} setSelectedResidence={setSelectedResidence}/>
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
