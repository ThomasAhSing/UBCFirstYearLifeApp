// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";

// project imports
import ScreenWrapper from '../ScreenWrapper';
import DayMonthBar from '@/app/EventsComponents/DayMonthBar'
import { Calendar, LocaleConfig, Agenda } from 'react-native-calendars';

const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10,
  '2025-07-28': 10,
  '2025-07-29': 13,
};

export default function MonthScreen({viewMode, setViewMode, dateString, setDateString}) {

  // const today = new Date().toISOString().split('T')[0]; // e.g. "2025-07-08"
  const windowWidth = Dimensions.get('window').width
  const dayButtonWidth = Math.floor(windowWidth / 8)
  const [selected, setSelected] = useState('')

  const onPress = () => {
    
  }
  return (
    <View style={styles.container}>
      
      
      <Calendar
        style={{
          borderWidth: 1,
          borderColor: 'transparent',
          height: 350,
        }}
        theme={{
          backgroundColor: 'white',
          calendarBackground: 'transparent',
          textSectionTitleColor: 'white',
          selectedDayBackgroundColor: 'red',
          selectedDayTextColor: 'white',
          todayTextColor: 'purple',
          dayTextColor: 'white',
          textDisabledColor: 'gray',
          monthTextColor: 'white',
        }}
        dayComponent={({ date, state }) => {
          const count = eventsByDate[date.dateString];
          return (
            <TouchableOpacity 
            onPress = {onPress}
            style={{ 
              alignItems: 'center',
              width: dayButtonWidth,
              height: 60,
              paddingTop: 15,
             }}>
              <Text
                style={[{
                  color: state === 'disabled' ? '#A9A9A9' : 'white',
                }, 
                dateString === date.dateString && {color: '#00BFFF'}
                ]}>
                {date.day}
              </Text>
              {count && (
                <Text style={{ 
                  fontSize: 11,
                  textAlign: 'center', 
                  color: '#FFD700',
                  marginTop: 12, }}>
                  {count} events
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        onDayPress={day => {
          setSelected(day.dateString);
        }}
        markedDates={{
          [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
