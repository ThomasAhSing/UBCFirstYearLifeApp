// external imports 
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

// project imports
import ScreenWrapper from '../ScreenWrapper';
import DayMonthBar from '@/app/EventsComponents/DayMonthBar'
import { Calendar, LocaleConfig, Agenda } from 'react-native-calendars';

const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10
};

export default function EventsScreen() {

    const [viewMode, setViewMode] = useState("Month")
    const [selected, setSelected] = useState('');
    return (
        <ScreenWrapper>
            <DayMonthBar viewMode={viewMode} setViewMode={setViewMode} />
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
                    textDisabledColor: 'gray'
                }}
                dayComponent={({ date, state }) => {
    const count = eventsByDate[date.dateString];

    return (
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            color: state === 'disabled' ? 'gray' : 'white',
            fontWeight: 'bold'
          }}>
          {date.day}
        </Text>
        {count && (
          <Text style={{ fontSize: 10, color: '#FFD700' }}>
            {count} events
          </Text>
        )}
      </View>
    );
  }}
                onDayPress={day => {
                    setSelected(day.dateString);
                }}
                markedDates={{
                    [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
                }}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({

});
