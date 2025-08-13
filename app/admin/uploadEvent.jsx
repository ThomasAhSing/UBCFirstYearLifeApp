import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import { api } from '@/context/DataContext';
import DateTimeInput from '@/app/admin/DateTimeInput';

export default function UploadEvent() {
    const { post } = useLocalSearchParams();
    const router = useRouter();

    let parsedPost = null;
    try { parsedPost = post ? JSON.parse(post) : null; } catch { parsedPost = null; }

    const [date, setDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

    const luxonDate = date
        ? DateTime.fromJSDate(date, { zone: 'America/Vancouver' })
        : null;

    const handleUpload = async () => {
        if (!parsedPost) return Alert.alert('Error', 'No post data found.');
        if (!luxonDate) return Alert.alert('Select date', 'Please pick a date & time for the event.');
        try {
            //   await api.post('/api/events', {
            //     ...parsedPost,
            //     isEvent: true,
            //     startAt: luxonDate.toISO(),
            //   });
            // await api.post
            const shortcode = parsedPost.shortcode;

    
            await api.post('/api/events', {
                shortcode,
                startAt: luxonDate.toISO(),
            });
            await api.patch(`/api/posts/${shortcode}`);
            Alert.alert('Success', 'Event uploaded successfully!');
            router.back();
        } catch (err) {
            console.error('Error uploading event:', err);
            Alert.alert('Error', 'Failed to upload event.');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>⬅ Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Mark Post as Event</Text>

            {!showPicker ? (
                <Button title="Pick Date & Time" onPress={() => setShowPicker(true)} />
            ) : (
                <>
                    <DateTimeInput value={date} onChange={setDate} />
                    <View style={{ height: 12 }} />
                    <Button title="Hide picker" onPress={() => setShowPicker(false)} />
                </>
            )}

            <Text style={styles.info}>
                Selected ISO: {luxonDate ? luxonDate.toISO() : '—'}
            </Text>
            {/* <Text style={styles.info}>
                Vancouver: {luxonDate ? `${luxonDate.toFormat('yyyy-MM-dd')} at ${luxonDate.toFormat('h a')}` : '—'}
            </Text> */}
            <Text style={styles.info}>
                Vancouver:{' '}
                {luxonDate
                    ? luxonDate.toFormat("yyyy-MM-dd 'at' h:mm a") // <-- show minutes
                    : '—'}
            </Text>

            <Button title="Upload Event" onPress={handleUpload} color="#4CAF50" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: 'black', flex: 1 },
    backButton: { marginBottom: 10 },
    backText: { color: '#4CAF50', fontSize: 16 },
    title: { fontSize: 20, color: 'white', marginBottom: 20, fontWeight: 'bold' },
    info: { color: 'white', marginTop: 10, marginBottom: 10, borderRadius: 7 },
});
