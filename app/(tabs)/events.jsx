// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";

// project imports
import ScreenWrapper from '../ScreenWrapper';
import DayMonthBar from '@/app/EventsComponents/DayMonthBar'
import MonthScreen from '@/app/EventsComponents/MonthScreen'
import DayScreen from '@/app/EventsComponents/DayScreen'

const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10,
  '2025-07-28': 10,
  '2025-07-29': 13,
};

export default function EventsScreen() {


  const [viewMode, setViewMode] = useState("Month")
  return (
    <ScreenWrapper>
      <View style={styles.dayMonthBar}>
        <DayMonthBar  viewMode={viewMode} setViewMode={setViewMode} />
      </View>
      {viewMode === "Month" && <MonthScreen/>}

      {viewMode === "Day" && <DayScreen/>}
      
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  dayMonthBar: {
  }
});
