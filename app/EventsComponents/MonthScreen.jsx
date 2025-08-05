// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useContext } from "react";
import { DateTime } from 'luxon';

// project imports 
import { Calendar } from 'react-native-calendars';
import DayScreen from '@/app/EventsComponents/DayScreen'
import BackIcon from '@/assets/icons/BackIcon'
import { Colors } from '@/constants/Colors';
import { DataContext } from '@/context/DataContext';


export default function MonthScreen() {

  const {
    monthEventsData, monthPostMap,
    todayISOString
  } = useContext(DataContext);

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
        dayComponent={({ date, state }) => { // NOTE: date is in UTC
          // console.log(date)
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
            dateString = {overlayDate}
            monthEventsData = {monthEventsData}
            monthPostMap = {monthPostMap}
          />
        </View>
      )}
    </View>
  );
}

function adjustCalendarDateToVancouver(dateStringUTC) {
  // Current time in Vancouver
  const nowVancouver = DateTime.now().setZone("America/Vancouver");

  // Calendar date at Vancouver midnight
  const calDateVancouverMidnight = DateTime
    .fromISO(dateStringUTC, { zone: "utc" })  // midnight UTC for that day
    .setZone("America/Vancouver")             // shift to Vancouver timezone
    .startOf("day");

  // If now is before Vancouver midnight of that day → use previous day
  if (nowVancouver < calDateVancouverMidnight) {
    return calDateVancouverMidnight.minus({ days: 1 }).toFormat("yyyy-MM-dd");
  }

  return calDateVancouverMidnight.toFormat("yyyy-MM-dd");
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    zIndex: 10,
    flex: 1,
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