import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
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
    const [title, setTitle] = useState(''); // ← optional title

    const luxonDate = date
        ? DateTime.fromJSDate(date, { zone: 'America/Vancouver' })
        : null;

    const handleUpload = async () => {
        if (!parsedPost) return Alert.alert('Error', 'No post data found.');
        if (!luxonDate) return Alert.alert('Select date', 'Please pick a date & time for the event.');
        try {
            const shortcode = parsedPost.shortcode;

            await api.post('/api/events', {
                shortcode,
                startAt: luxonDate.toISO(),
                title: title?.trim() || undefined, // ← include only if provided
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
            <Text style={styles.info}>
                Vancouver:{' '}
                {luxonDate
                    ? luxonDate.toFormat("yyyy-MM-dd 'at' h:mm a")
                    : '—'}
            </Text>

            {/* Optional Title Input (between Vancouver and Upload button) */}
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Optional title"
                placeholderTextColor="#9AA4AF"
                style={styles.input}
            />

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
    input: {
        backgroundColor: '#0f172a',
        color: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#173E63',
        marginBottom: 12,
    },
});
