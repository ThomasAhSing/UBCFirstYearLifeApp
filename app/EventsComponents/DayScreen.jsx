// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";

// project imports

const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10,
  '2025-07-28': 10,
  '2025-07-29': 13,
};

export default function DayScreen() {


  const [viewMode, setViewMode] = useState("Month")
  return (
    <Text>Day</Text>
  );
}

const styles = StyleSheet.create({
  container: {
  }
});
