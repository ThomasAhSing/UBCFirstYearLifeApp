// external imports 
import { StyleSheet, Text, View, FlatList } from "react-native";
import { DateTime } from 'luxon';

// project imports
import Post from "@/app/HomeComponents/Post"




export default function DayScreen({ eventsData, postMap }) {

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.keys(eventsData)}
        renderItem={({ item: date }) => {
          return (
            <View>
              <Text style={styles.dateHeading}>{formatDatestringToTitle(date)}</Text>
              <FlatList
                data={eventsData[date]}
                renderItem={({ item: eventObj }) => {
                  return (
                    <View>
                      <Text style={styles.timeText}>{formatEventTimePDT(eventObj.startAt)}</Text>
                      <Post post={postMap[eventObj.shortcode]} />
                    </View>
                  )
                }}
              />
            </View>
          )
        }}
      />
    </View>
  )
}

// "2025-07-08" -> 8 July
function formatDatestringToTitle(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Vancouver'
  }); // e.g. "8 July"
}

// ISO String to 9 A.M.
function formatEventTimePDT(startAt) {
  return DateTime.fromISO(startAt, { zone: 'America/Vancouver' })
    .toFormat("h a")
    .replace("AM", "A.M.")
    .replace("PM", "P.M.");
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