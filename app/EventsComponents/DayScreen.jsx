// external imports 
import { StyleSheet, Text, View, FlatList } from "react-native";
import { useState } from "react";

import eventsData from '@/data/events.json'
import postData from '@/data/posts/all_posts.json'
import EventsOfDay from "@/app/EventsComponents/EventsOfDay";

// project imports

const eventsByDate = {
  '2025-07-03': 3,
  '2025-07-10': 1,
  '2025-07-27': 10,
  '2025-07-28': 10,
  '2025-07-29': 13,
};

export default function DayScreen({ dateString }) {
  const allDaysInMonth = getAllDaysOfMonth(dateString)
  // console.log(allDaysInMonth)
  const shortcodes = eventsData[dateString] || []
  const posts = shortcodes.map(shortcode => postData[shortcode])

  posts.sort((a, b) =>
    new Date(a.dateTimeOfEvent) - new Date(b.dateTimeOfEvent)
  );

  // console.log(posts)

  const [viewMode, setViewMode] = useState("Month")
  return (
    // <Text>Day {date.day}</Text>
    <View>
      {/* <Text>Day</Text> */}
      <FlatList
        data={allDaysInMonth}
        renderItem={({item}) => (
          <EventsOfDay dateString={item}/>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  }
});


function getAllDaysOfMonth(dateString) {
  const [year, month] = dateString.split('-');
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based here

  const result = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayString = String(day).padStart(2, '0');
    result.push(`${year}-${month}-${dayString}`);
  }

  return result;
}