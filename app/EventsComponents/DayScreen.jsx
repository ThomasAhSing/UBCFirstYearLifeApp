// external imports 
import { StyleSheet, Text, View, FlatList } from "react-native";
import { useState } from "react";

import eventsData from '@/data/events.json'
import postData from '@/data/posts/all_posts.json'
import Sidecar from "@/app/Sidecar"
import Post from "@/app/Post"



// project imports

const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10,
  '2025-07-28': 10,
  '2025-07-29': 13,
};

export default function DayScreen({ dateString }) {


  const eventsOfMonthFlatListData = buildFlatEventsOfMonth(dateString)

  const [viewMode, setViewMode] = useState("Month")
  return (
    <View style={styles.container}>
      <FlatList
        data={eventsOfMonthFlatListData}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View style={styles.dateHeadingContainer}>
                <Text style={styles.dateHeading}>{formatDateInPDT(item.date)}</Text>
                {item.noEvents &&
                  <Text style={styles.noEventsToday}>Currently no events today. Scroll to see future events.</Text>}
              </View>

            )
          } else if (item.type === "post") {
            return (
              <View>
                <Text style={styles.timeText}>{formatTimeInPDT(item.postData.dateTimeOfEvent)}</Text>
                <Post post={item.postData} />
              </View>

            )
          }
        }}
      />
    </View>
  );
}

function buildFlatEventsOfMonth(dateString) {
  const [year, month] = dateString.split('-');
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based here
  const result = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayString = String(day).padStart(2, '0');
    const fullDate = `${year}-${month}-${dayString}`
    const shortcodes = eventsData[fullDate] || []
    if (shortcodes.length === 0) {
      if (fullDate === dateString) {
        result.push({
          type: "header",
          date: fullDate,
          noEvents: true,
        })
      }
    } else {
      result.push({
        type: "header",
        date: fullDate,
        noEvents: false,
      })
      const posts = shortcodes.map(shortcode => postData[shortcode])
      posts.sort((a, b) =>
        new Date(a.dateTimeOfEvent) - new Date(b.dateTimeOfEvent)
      );
      posts.forEach((post) => {
        result.push({
          type: "post",
          date: fullDate,
          postData: post,
        })
      });
    }

  }
  console.log(result)
  return result;
}

function formatDateInPDT(dateString) {
  const date = new Date(dateString + 'T00:00:00'); // add time to prevent UTC offset
  const options = { timeZone: 'America/Los_Angeles', day: 'numeric', month: 'long' };
  return date.toLocaleString('en-US', options);
}

function formatTimeInPDT(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
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
    // paddingLeft: 15,
  },
  noEventsToday: {
    color: 'white',
    fontSize: 17,
    // paddingLeft: 15,
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