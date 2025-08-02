// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList } from "react-native";
import { useState } from "react";

import eventsData from '@/data/events.json'
import postData from '@/data/posts/all_posts.json'
import Sidecar from "@/app/HomeComponents/Sidecar";

// project imports


export default function EventsOfDay({ dateString }) {
  const shortcodes = eventsData[dateString] || []
  const posts = shortcodes.map(shortcode => postData[shortcode])

  posts.sort((a, b) =>
    new Date(a.dateTimeOfEvent) - new Date(b.dateTimeOfEvent)
  );

//   console.log(posts)

  return (
    <View>
        <Text>{formatDateInPDT(dateString)}</Text>
        <FlatList
            data={posts}
            renderItem={({item}) => (
                <Sidecar post={item}/>
            )}
        />
        
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {

  }
});


function formatDateInPDT(dateString) {
  const date = new Date(dateString + 'T00:00:00'); // add time to prevent UTC offset
  const options = { timeZone: 'America/Los_Angeles', day: 'numeric', month: 'long' };
  return date.toLocaleString('en-US', options);
}