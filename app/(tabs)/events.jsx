// external imports 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { DateTime } from 'luxon';
import { Colors } from '@/constants/Colors';
import axios from 'axios'

// project imports
import ScreenWrapper from '@/app/ScreenWrapper';
import DayMonthBar from '@/app/EventsComponents/DayMonthBar'
import MonthScreen from '@/app/EventsComponents/MonthScreen'
import DayScreen from '@/app/EventsComponents/DayScreen'
import Heading from "@/app/Heading"

export default function EventsScreen() {

  const pdtMidnight = DateTime.now().setZone('America/Vancouver').startOf('day');
  const todayISOString = pdtMidnight.toISO();

  const [viewMode, setViewMode] = useState("Day")

  const [eventsData, setEventsData] = useState([])
  const [postMap, setPostMap] = useState({})
  const [loading, setLoading] = useState(true);
  
  const [monthEventsData, setMonthEventsData] = useState([])
  const [monthPostMap, setMonthPostMap] = useState({})
  const [monthLoading, setMonthLoading] = useState(true);

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const res = await axios.get("http://localhost:10000/api/events", {
          params: {
            fromDate: todayISOString
          }
        })
        setEventsData(formatEventsData(res.data.events));
        const shortcodes = res.data.events.map(event => event.shortcode)

        const postResponses = await Promise.all(
          shortcodes.map(sc => axios.get(`http://localhost:10000/api/posts/${sc}`).then(res => res.data))
        )

        const postMap = {}
        postResponses.forEach(post => {
          postMap[post.shortcode] = post;
        });
        setPostMap(postMap);
      } catch (err) {
        console.error('Failed to fetch events or posts', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEventsData();
  }, []);

  useEffect(() => {
    const fetchMonthEventsData = async () => {
      try {
        const res = await axios.get("http://localhost:10000/api/events", {
          params: {
            fromDate: subtractOneMonthISOStringPDT(todayISOString),
            maxDaysToCheck: 90,
            maxResults: 100
          }
        })

        setMonthEventsData(formatEventsData(res.data.events));
        const shortcodes = res.data.events.map(event => event.shortcode)

        const postResponses = await Promise.all(
          shortcodes.map(sc => axios.get(`http://localhost:10000/api/posts/${sc}`).then(res => res.data))
        )

        const monthPostMap = {}
        postResponses.forEach(post => {
          monthPostMap[post.shortcode] = post;
        });
        setMonthPostMap(monthPostMap);
      } catch (err) {
        console.error('Failed to fetch events or posts', err);
      } finally {
        setMonthLoading(false);
      }
    }
    fetchMonthEventsData();

  }, []);

  // TODO make loading component
  if (loading) return <Text style={{ flex: 1, color: 'white', backgroundColor: Colors.background }}>Day Loading...</Text>;
  if (monthLoading) return <Text style={{ flex: 1, color: 'white', backgroundColor: Colors.background }}>Month Loading...</Text>;
    console.log("monthEventsData")
    console.log(monthEventsData)
    console.log("monthPostMap")
    console.log(monthPostMap)

  return (
    <ScreenWrapper>
      <Heading />
      <View style={styles.dayMonthBar}>
        <DayMonthBar viewMode={viewMode} setViewMode={setViewMode} />
      </View>
      <View style={{ flex: 1 }}>
        {viewMode === "Month" && <MonthScreen monthEventsData ={monthEventsData} monthPostMap = {monthPostMap} todayISOString = {todayISOString} />}
        {viewMode === "Day" && <DayScreen eventsData={eventsData} postMap={postMap} />}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  dayMonthBar: {
  }
});

// helper methods
function formatEventsData(fetchedEventsData = []) {
  const grouped = {};

  fetchedEventsData.forEach(event => {
    const date = new Date(event.startAt);

    const key = date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Vancouver'  // ensures correct PDT date
    }); // e.g. "2025-07-08"

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(event);
  });

  return grouped;
}

function subtractOneMonthISOStringPDT(isoString) {
  return DateTime
    .fromISO(isoString, { zone: 'America/Vancouver' }) // interpret in PDT
    .minus({ months: 1 })
    .toISO(); // returns ISO string in UTC (Z)
}