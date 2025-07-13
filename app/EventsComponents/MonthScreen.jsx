// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";

// project imports 
import { Calendar, LocaleConfig, Agenda } from 'react-native-calendars';
import eventsData from '@/data/events.json'
import DayScreen from '@/app/EventsComponents/DayScreen'


const eventsByDate = {
  '2025-07-13': 2,
  '2025-07-16': 2,
};

export default function MonthScreen({ dateString }) {

  // const today = new Date().toISOString().split('T')[0]; // e.g. "2025-07-08"
  const windowWidth = Dimensions.get('window').width
  const dayButtonWidth = Math.floor(windowWidth / 8)
  const [selected, setSelected] = useState('')
  const [overlayDate, setOverlayDate] = useState(null);


  const onPress = (dateString) => {
    const shortcodes = eventsData[dateString]
    if (shortcodes.length === 0) {
      return
    }
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
              onPress={() => {
                const shortcodes = eventsData[date.dateString] || [];
                if (shortcodes.length > 0) {
                  setOverlayDate(date.dateString); // this triggers the overlay view
                }
              }}
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
                dateString === date.dateString && { color: '#00BFFF' }
                ]}>
                {date.day}
              </Text>
              {count && (
                <Text style={{
                  fontSize: 11,
                  textAlign: 'center',
                  color: '#FFD700',
                  marginTop: 12,
                }}>
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

      {overlayDate && (
        <View style={styles.overlay}>
          <DayScreen
            dateString={overlayDate}
            singleDay={true}
          />
          <TouchableOpacity
            style={styles.closeOverlay}
            onPress={() => setOverlayDate(null)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#001f3f', // dark background
    zIndex: 10,
    paddingTop: 50,
  },

  closeOverlay: {
    position: 'absolute',
    top: 30,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    zIndex: 11,
  },

  closeText: {
    color: 'white',
    fontSize: 16,
  },
});
