import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { DateTime } from 'luxon';

// TODO make loading component
export const DataContext = createContext();
console.log(process.env.EXPO_PUBLIC_API_BASE_URL)
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:10000"
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const DataProvider = ({ children }) => {
    const pdtMidnight = DateTime.now().setZone('America/Vancouver').startOf('day');
    const todayISOString = pdtMidnight.toISO();

    const [postData, setPostData] = useState([]);
    const [postedConfessionsByResidence, setPostedConfessionsByResidence] = useState({
        "TotemPark": [],
        "OrchardCommons": [],
        "PlaceVanier": []
    });
    const [dayEventsData, setDayEventsData] = useState([]);
    const [dayPostMap, setDayPostMap] = useState({});
    const [monthEventsData, setMonthEventsData] = useState([]);
    const [monthPostMap, setMonthPostMap] = useState({});

    const [postDataLoaded, setPostDataLoaded] = useState(false);
    const [postedConfessionsDataLoaded, setPostedConfessionsDataLoaded] = useState(false);
    const [dayEventsDataLoaded, setDayEventsDataLoaded] = useState(false);
    const [monthEventsDataLoaded, setMonthEventsDataLoaded] = useState(false);

    const [postedConfessionsDataLoading, setPostedConfessionsDataLoading] = useState(false);
    const [dayEventsDataLoading, setDayEventsDataLoading] = useState(false);
    const [monthEventsDataLoading, setMonthEventsDataLoading] = useState(false);



    const loadAllPostedConfessions = async () => {
        setPostedConfessionsDataLoading(true);
        try {
            const residences = ["TotemPark", "OrchardCommons", "PlaceVanier"];

            const results = await Promise.all(
                residences.map(residence =>
                    api
                        .get(`/api/confessions/posted?residence=${residence}`)
                        .then(res => ({
                            residence,
                            data: formatFetchedData(res.data)
                        }))
                )
            );

            const newData = {};
            for (const { residence, data } of results) {
                newData[residence] = data;
            }

            setPostedConfessionsByResidence(newData);
            setPostedConfessionsDataLoaded(true);
        } catch (err) {
            console.error('Failed to load posted confessions:', err);
        } finally {
            setPostedConfessionsDataLoading(false);
        }
    };

    const loadDayEvents = async () => {
        setDayEventsDataLoading(true);
        try {
            const dayEventsRes = await api.get("/api/events", {
                params: { fromDate: todayISOString }
            });
            setDayEventsData(formatEventsData(dayEventsRes.data.events));

            const dayShortcodes = dayEventsRes.data.events.map(event => event.shortcode);
            const dayPostResponses = await Promise.all(
                dayShortcodes.map(sc =>
                    api.get(`/api/posts/${sc}`).then(res => res.data)
                )
            );

            const dayPostMapTemp = {};
            dayPostResponses.forEach(post => {
                dayPostMapTemp[post.shortcode] = post;
            });
            setDayPostMap(dayPostMapTemp);
            setDayEventsDataLoaded(true);
        } catch (err) {
            console.error("Failed to load day events:", err);
        } finally {
            setDayEventsDataLoading(false);
        }
    };

    const loadMonthEvents = async () => {
        setMonthEventsDataLoading(true);
        try {
            const monthEventsRes = await api.get("/api/events", {
                params: {
                    fromDate: subtractOneMonthISOStringPDT(todayISOString),
                    maxDaysToCheck: 90,
                    maxResults: 100
                }
            });
            setMonthEventsData(formatEventsData(monthEventsRes.data.events));

            const monthShortcodes = monthEventsRes.data.events.map(event => event.shortcode);
            const monthPostResponses = await Promise.all(
                monthShortcodes.map(sc =>
                    api.get(`/api/posts/${sc}`).then(res => res.data)
                )
            );

            const monthPostMapTemp = {};
            monthPostResponses.forEach(post => {
                monthPostMapTemp[post.shortcode] = post;
            });
            setMonthPostMap(monthPostMapTemp);
            setMonthEventsDataLoaded(true);
        } catch (err) {
            console.error("Failed to load month events:", err);
        } finally {
            setMonthEventsDataLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialPosts = async () => {
            try {
                const postRes = await api.get("/api/posts");
                // console.log(postRes.data.posts);
                setPostData(postRes.data.posts);
                setPostDataLoaded(true);
            } catch (err) {
                console.error("Failed to load posts:", err);
            }

            loadAllPostedConfessions();
            loadDayEvents();
            loadMonthEvents();
        };

        loadInitialPosts();
    }, []);

    return (
        <DataContext.Provider value={{
            postData, postedConfessionsByResidence, dayEventsData, dayPostMap, monthEventsData, monthPostMap,
            postDataLoaded, postedConfessionsDataLoaded, dayEventsDataLoaded, monthEventsDataLoaded,
            postedConfessionsDataLoading, dayEventsDataLoading, monthEventsDataLoading,
            // setPostedConfessionsByResidence, setDayEventsData, setDayPostMap, setMonthEventsData, setMonthPostMap,
            // setPostedConfessionsDataLoaded, setDayEventsDataLoaded, setMonthEventsDataLoaded,
            // setPostedConfessionsDataLoading, setDayEventsDataLoading, setMonthEventsDataLoading,
            loadAllPostedConfessions, loadDayEvents, loadMonthEvents,
            todayISOString
        }}>
            {children}
        </DataContext.Provider>
    );
};

// helper methods
function formatFetchedData(fetchedConfessions = []) {
    const grouped = {};
    for (const conf of fetchedConfessions) {
        if (!grouped[conf.postID]) {
            grouped[conf.postID] = [];
        }
        grouped[conf.postID].push(conf);
    }

    // Step 2: Sort postIDs descending
    const sortedPostIDs = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => b - a);

    // Step 3: For each postID, sort its confessions by confessionIndex ascending
    const result = sortedPostIDs.map(postID =>
        grouped[postID].sort((a, b) => a.confessionIndex - b.confessionIndex)
    );

    return result;
}

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