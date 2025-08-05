// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useEffect, useContext } from "react";
import { Colors } from '@/constants/Colors';

// project imports
import ScreenWrapper from '@/app/ScreenWrapper';
import DayMonthBar from '@/app/EventsComponents/DayMonthBar'
import MonthScreen from '@/app/EventsComponents/MonthScreen'
import DayScreen from '@/app/EventsComponents/DayScreen'
import Heading from "@/app/Heading"
import { DataContext } from '@/context/DataContext';

export default function EventsScreen() {
  const {
    dayEventsDataLoaded, monthEventsDataLoaded,
    dayEventsDataLoading, monthEventsDataLoading,
    loadDayEvents, loadMonthEvents
  } = useContext(DataContext);

  const [viewMode, setViewMode] = useState("Day")

  useEffect(() => {
    if (!dayEventsDataLoaded && !dayEventsDataLoading) {
      loadDayEvents();
    }
    if (!monthEventsDataLoaded && !monthEventsDataLoading) {
      loadMonthEvents();
    }
  }, []);

  if (dayEventsDataLoading) {
    return <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>Loading Day Events...</Text>;
  }
  if (monthEventsDataLoading) {
    return <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>Loading Month Events...</Text>;
  }

  if (!dayEventsDataLoaded) {
    return <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>Failed to load Day Events from server...</Text>;
  }
  if (!monthEventsDataLoaded) {
    return <Text style={{ paddingTop: 50, paddingLeft: 50, flex: 1, color: 'white', backgroundColor: Colors.background }}>Failed to load Month Events from server...</Text>;
  }

  return (
    <ScreenWrapper>
      <Heading />
      <View style={styles.dayMonthBar}>
        <DayMonthBar viewMode={viewMode} setViewMode={setViewMode} />
      </View>
      <View style={{ flex: 1 }}>
        {viewMode === "Month" && <MonthScreen/>}
        {viewMode === "Day" && <DayScreen/>}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  dayMonthBar: {
  }
});

