// external imports 
import { StyleSheet, Text, View, FlatList } from "react-native";
import { DateTime } from 'luxon';
import { useContext } from "react";

// project imports
import Post from "@/app/HomeComponents/Post"
import { DataContext } from '@/context/DataContext';
import { Colors } from '@/constants/Colors';
import AnimateOpen from '@/app/AnimateOpen';

export default function DayScreen({ dateString, monthEventsData, monthPostMap }) {
  let {
    dayEventsData, dayPostMap
  } = useContext(DataContext);

  if (dateString) {
    if (!monthEventsData || !monthPostMap) {
      return (
        <Text
          style={{
            color: 'white',
            backgroundColor: Colors.background,
            paddingLeft: 10
          }}>
          No events on this day</Text>
      )

    }
    dayEventsData = filterEventsDataOneDay(dateString, monthEventsData);
    dayPostMap = monthPostMap;
  }

  return (
    <AnimateOpen>
      <View style={styles.container}>
        <FlatList
          data={Object.keys(dayEventsData)}
          renderItem={({ item: date }) => {
            return (
              <View>
                <Text style={styles.dateHeading}>{formatDatestringToTitle(date)}</Text>
                <FlatList
                  data={dayEventsData[date]}
                  renderItem={({ item: eventObj }) => {
                    return (
                      <View>
                        <Text style={styles.timeText}>{formatEventTimePDT(eventObj.startAt)}</Text>
                        <Post post={dayPostMap[eventObj.shortcode]} />
                      </View>
                    )
                  }}
                />
              </View>
            )
          }}
        />
      </View>
    </AnimateOpen>
  )
}

// "2025-07-08" -> 8 July
function formatDatestringToTitle(dateString) {
  const [year, month, day] = dateString.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${parseInt(day, 10)} ${monthNames[parseInt(month, 10) - 1]}`;
}

// ISO String to 9 A.M.
function formatEventTimePDT(startAt) {
  return DateTime.fromISO(startAt, { zone: 'America/Vancouver' })
    .toFormat("h:mm a")
    .replace("AM", "A.M.")
    .replace("PM", "P.M.");
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
  dateHeadingContainer: {
    paddingLeft: 15,
    paddingBottom: 30,
  },
  dateHeading: {
    color: 'white',
    fontFamily: 'CourgetteRegular',
    fontSize: 25,
    paddingLeft: 15,
  },
  timeText: {
    color: 'white',
    fontFamily: 'CourgetteRegular',
    paddingLeft: 15,
    fontSize: 20,
    paddingBottom: 10,
    paddingTop: 10,
  }
});