import React, { useState } from 'react';
import { View, Text, Button, TextInput, Platform, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import axios from 'axios';

export default function UploadEvent() {
    const { post } = useLocalSearchParams();
    const router = useRouter();
    const parsedPost = post ? JSON.parse(post) : null;

    const [date, setDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

    const luxonDate = DateTime.fromJSDate(date, { zone: 'America/Vancouver' });

    const handleChange = (selectedDate) => {
        if (selectedDate) setDate(selectedDate);
        setShowPicker(false);
    };

    const markAsEvent = (shortcode) => {
        // console.log(selectedMap[shortcode])
        if (date) { 
            console.log("Mark event")
        } else {
            console.log("Select date")
        }

    }

    const handleUpload = async () => {
        if (!parsedPost) {
            Alert.alert("Error", "No post data found.");
            return;
        }

        try {
            const payload = {
                ...parsedPost,
                isEvent: true,
                startAt: luxonDate.toISO(),
            };

            const res = await axios.post('http://localhost:10000/api/events', payload);
            Alert.alert("Success", "Event uploaded successfully!");

        } catch (err) {
            console.error("Error uploading event:", err);
            Alert.alert("Error", "Failed to upload event.");
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>⬅ Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Mark Post as Event</Text>


            <Button title="Pick Date & Time" onPress={() => setShowPicker(true)} />
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleChange}
                />
            )}

            <Text style={styles.info}>Selected ISO: {luxonDate.toISO()}</Text>
            <Text style={styles.info}>
                Vancouver: {luxonDate.toFormat("yyyy-MM-dd")} at {luxonDate.toFormat("h a")}
            </Text>

            <Button title="Upload Event" onPress={markAsEvent} color="#4CAF50" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'black',
        flex: 1,
    },
    backButton: {
        marginBottom: 10,
    },
    backText: {
        color: '#4CAF50',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    label: {
        color: 'white',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#1c1c1c',
        borderColor: '#555',
        borderWidth: 1,
        borderRadius: 6,
        color: 'white',
        padding: 10,
        marginBottom: 20,
    },
    info: {
        color: 'white',
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 7,
    },
});
