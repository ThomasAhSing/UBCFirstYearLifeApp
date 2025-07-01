// external imports
import { StyleSheet, Text } from 'react-native';
import { useState } from 'react'

// TODO, add popup telling user what confessions is when they first open

// project imports
import ScreenWrapper from "../ScreenWrapper";
import Heading from "../Heading"
import ConfessionsOptionsBar from '../confessionComponents/ConfessionsOptionsBar';

export default function ConfessionsScreen() {
  const [selectedResidence, setSelectedResidence] = useState("Totem Park")

  return (
    <ScreenWrapper>
      <Heading/>
      <ConfessionsOptionsBar selectedResidence={selectedResidence} setSelectedResidence={setSelectedResidence}/>
      <Text style={{color: 'white'}}>Confessions</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  
});
