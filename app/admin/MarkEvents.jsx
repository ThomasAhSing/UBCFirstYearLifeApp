import { View, Text, StyleSheet, Button, FlatList, TextInput, Pressable, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { DataContext } from '@/context/DataContext';
// import CheckBox from '@react-native-community/checkbox';

import Heading from '@/app/Heading';
import Post from '@/app/HomeComponents/Post'
import ScreenWrapper from '@/app/ScreenWrapper';
import axios from 'axios';
import DateTimeInput from '@/app/admin/DateTimeInput'
import UploadEvent from '@/app/admin/uploadEvent'




export default function MarkEvents() {
    const {
        postData,
        postDataLoaded
    } = useContext(DataContext);

    const router = useRouter();

    if (!postDataLoaded) return (
        <ScreenWrapper bgColor='black'>
            <Heading />
            <Text style={{ color: "white" }}>Loading home...</Text>
            <DateTimeInput />
        </ScreenWrapper>
    )

    return (
        <ScreenWrapper bgColor='black'>
            <View style={styles.header}>
                <View style={styles.backButton}>
                    <Button title="⬅ Back" onPress={() => router.back()} />
                </View>
                <Heading />
            </View>

            <FlatList
                // style={styles.container}
                data={postData}
                renderItem={({ item }) => {
                    return (
                        <View>
                            <Post post={item} />


                            <TouchableOpacity
                                style={styles.uploadEventBtn}
                                onPress={() =>
                                    router.push({
                                        pathname: '/admin/uploadEvent', // regular file, not [shortcode].tsx
                                        params: {
                                            post: JSON.stringify(item), // must be string
                                        },
                                    })
                                }
                            >
                                <Text style={{ color: 'lightblue' }}>Mark as Event</Text>
                            </TouchableOpacity>
                            {/* <DateTimeInput /> */}
                        </View>

                    )
                }}
            />
            {/* <UploadEvent/> */}


        </ScreenWrapper>

    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    backButton: {
        // position: 'absolute',
        // top: 50, // adjust for your header height
        // left: 20,
    },
    button: {
        width: '80%',
        marginVertical: 10,
        marginBottom: 30
    },
    header: {
        flexDirection: 'row',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        color: 'white'
        // marginBottom: 16
    },
    eventButton: {
        width: 100,
        borderRadius: 5,
        padding: 10
    },
    uploadEventBtn: {
        backgroundColor: 'orange',
        width: 200,
        borderRadius: 5,
        padding: 10,
    }
});
