// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { DateTime } from 'luxon';




// project imports
import ScreenWrapper from '../ScreenWrapper';
import DayMonthBar from '@/app/EventsComponents/DayMonthBar'
import MonthScreen from '@/app/EventsComponents/MonthScreen'
import DayScreen from '@/app/EventsComponents/DayScreen'
import Heading from "@/app/Heading"


const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10,
  '2025-07-28': 10,
  '2025-07-29': 13,
};

export default function EventsScreen() {


  // const todayDateString = new Date().toISOString().split('T')[0]; // e.g. "2025-07-08"
  // PDT
  const todayDateString = DateTime.now().setZone('America/Los_Angeles').toFormat('yyyy-MM-dd');
  console.log(todayDateString)

  const [viewMode, setViewMode] = useState("Day")
  const [dateString, setDateString] = useState(todayDateString)




  return (
    <ScreenWrapper>
      <Heading />
      <View style={styles.dayMonthBar}>
        <DayMonthBar viewMode={viewMode} setViewMode={setViewMode}/>
      </View>
      <View style={{ flex: 1 }}>
        {viewMode === "Month" &&
          <MonthScreen
            viewMode={viewMode} setViewMode={setViewMode}
            dateString={dateString} setDateString={setDateString}
          />}

        {viewMode === "Day" && <DayScreen dateString={todayDateString}/>}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  dayMonthBar: {
  }
});
