// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";
import { DateTime } from 'luxon';

// project imports 
import { Calendar } from 'react-native-calendars';
import DayScreen from '@/app/EventsComponents/DayScreen'
import BackIcon from '@/assets/icons/BackIcon'
import { Colors } from '@/constants/Colors';


export default function MonthScreen({ monthEventsData, monthPostMap, todayISOString }) {

  const windowWidth = Dimensions.get('window').width
  const dayButtonWidth = Math.floor(windowWidth / 8)
  const [selected, setSelected] = useState('')
  const [overlayDate, setOverlayDate] = useState(null);

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
          const count = date.dateString in monthEventsData ? monthEventsData[date.dateString].length : 0
          return (
            <TouchableOpacity
              onPress={() => {
                // const shortcodes = eventsData[date.dateString] || [];
                // const numEvents = monthEventsData
                if (count > 0) {
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
                isSameDate(todayISOString, date.dateString) && { color: '#00BFFF' }
                ]}>
                {date.day}
              </Text>
              {count > 0 && (
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
          <TouchableOpacity style={styles.backBtn} onPress={() => setOverlayDate(null)}>
            <BackIcon size={30} color='white' />
          </TouchableOpacity> 
          <DayScreen
            eventsData={filterEventsDataOneDay(overlayDate, monthEventsData)} postMap={monthPostMap}
          />
          {/* <TouchableOpacity
            style={styles.closeOverlay}
            onPress={() => setOverlayDate(null)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity> */}
        </View>
      )}
    </View>
  );
}

function filterEventsDataOneDay(dateString, monthEventsData) {
  if (monthEventsData.hasOwnProperty(dateString)) {
    return { [dateString]: monthEventsData[dateString] };
  } else {
    return {};
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: Colors.background,
    zIndex: 10,
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
  backBtn: {
    paddingTop: 10,
    paddingBottom: 10,
  }
});


function isSameDate(isoWithTime, dateOnlyString) {
  const dt1 = DateTime.fromISO(isoWithTime, { zone: 'America/Vancouver' }).startOf('day');
  const dt2 = DateTime.fromISO(dateOnlyString, { zone: 'America/Vancouver' }).startOf('day');

  return dt1.hasSame(dt2, 'day');
}