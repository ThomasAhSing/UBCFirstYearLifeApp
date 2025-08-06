import { View, Text, StyleSheet, Button } from 'react-native'
// docs https://docs.expo.dev/versions/latest/sdk/imagepicker/
// firebase https://github.com/expo/examples/tree/master/with-firebase-storage-upload

export default function CreatePost() {
    // const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.backButton}>
                <Button title="⬅ Back" onPress={() => router.back()} />
            </View>
            <Button style={styles.button} title="📋 Manage Existing Posts" onPress={() => router.push('/admin/ManagePosts')} />
            <Button style={styles.button} title="➕ Create New Post" onPress={() => router.push('/admin/CreatePost')} />
        </View>
    )
}