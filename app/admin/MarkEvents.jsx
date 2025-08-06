import { View, Text, StyleSheet, Button, FlatList, TextInput } from 'react-native'
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { DataContext } from '@/context/DataContext';
import CheckBox from '@react-native-community/checkbox';

import Heading from '@/app/Heading';
import Post from '@/app/HomeComponents/Post'
import ScreenWrapper from '@/app/ScreenWrapper';


export default function MarkEvents() {
    const router = useRouter();
    const [selectedMap, setSelectedMap] = useState({}); // { shortcode: boolean }

    const toggleSelection = (shortcode, newValue) => {
        setSelectedMap(prev => ({
            ...prev,
            [shortcode]: newValue
        }));
        console.log(shortcode, selectedMap[shortcode])
    };

    const {
        postData,
        postDataLoaded
    } = useContext(DataContext);

    if (!postDataLoaded) return (
        <ScreenWrapper bgColor='black'>
            <Heading />
            <Text style={{ color: "white" }}>Loading home...</Text>
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
                            <CheckBox
                                value={selectedMap[item.shortcode] || false}
                                onValueChange={(newValue) => toggleSelection(item.shortcode, newValue)}
                                tintColors={{ true: '#2196F3', false: '#aaa' }}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Type here..."
                                placeholderTextColor="#888"
                            // value={name}
                            // onChangeText={setName} // update state whenever the text changes
                            />
                        </View>

                    )
                }}
            />

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
        marginBottom: 16
    },
});
