// external imports 
import { StyleSheet, Text, View, FlatList } from "react-native";
import { useState } from "react";

import eventsData from '@/data/events.json'
import postData from '@/data/posts/all_posts.json'
import Post from "@/app/HomeComponents/Post"
import { DateTime } from 'luxon';



// project imports

const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10,
  '2025-07-28': 10,
  '2025-07-29': 13,
};

const todayDateString = DateTime.now().setZone('America/Los_Angeles').toFormat('yyyy-MM-dd');
export default function DayScreen({ dateString, singleDay = false }) {


  let eventsOfMonthFlatListData = undefined
  if (singleDay) {
    eventsOfMonthFlatListData = buildFlatSingleDay(dateString)
  } else {
    eventsOfMonthFlatListData = buildFlatNextEventDays(dateString)
  }


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



function buildFlatNextEventDays(dateString, maxDays = 30, requiredDaysWithEvents = 7) {
  const result = [];
  const startDate = DateTime.fromISO(dateString).setZone('America/Los_Angeles');

  let eventDaysFound = 0;

  for (let i = 0; i < maxDays; i++) {
    const current = startDate.plus({ days: i });
    const fullDate = current.toFormat('yyyy-MM-dd');
    const shortcodes = eventsData[fullDate] || [];

    if (shortcodes.length > 0) {
      result.push({
        type: "header",
        date: fullDate,
        noEvents: false,
      });

      const posts = shortcodes
        .map(shortcode => postData[shortcode])
        .filter(post => !!post);

      posts.sort((a, b) =>
        new Date(a.dateTimeOfEvent) - new Date(b.dateTimeOfEvent)
      );

      posts.forEach(post => {
        result.push({
          type: "post",
          date: fullDate,
          postData: post,
        });
      });

      // ✅ Only count days with events *after* today
      if (i > 0) {
        eventDaysFound++;
      }

    } else if (i === 0) {
      // ✅ Today has no events — add noEvents header
      result.push({
        type: "header",
        date: fullDate,
        noEvents: true,
      });
    }

    if (eventDaysFound >= requiredDaysWithEvents) break;
  }

  return result;
}

function buildFlatSingleDay(dateString) {
  const result = [];

  const shortcodes = eventsData[dateString] || [];

  if (shortcodes.length === 0) {
    result.push({
      type: "header",
      date: dateString,
      noEvents: true,
    });
  } else {
    result.push({
      type: "header",
      date: dateString,
      noEvents: false,
    });

    const posts = shortcodes
      .map(shortcode => postData[shortcode])
      .filter(post => !!post);

    posts.sort((a, b) =>
      new Date(a.dateTimeOfEvent) - new Date(b.dateTimeOfEvent)
    );

    posts.forEach(post => {
      result.push({
        type: "post",
        date: dateString,
        postData: post,
      });
    });
  }

  return result;
}

function formatDateInPDT(dateString) {
  if (dateString == todayDateString) {
    return "Today"
  }
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