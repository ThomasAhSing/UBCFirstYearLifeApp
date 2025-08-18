import { View, Text, StyleSheet, Button } from 'react-native'
import { useRouter } from 'expo-router';


export default function AdminDashboard() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.backButton}>
                <Button title="⬅ Back" onPress={() => router.back()} />
            </View>
            <Button style={styles.button} title="📋 Mark Post as Events" onPress={() => router.push('/admin/MarkEvents')} />
            <Button style={styles.button} title="➕ Create New Post" onPress={() => router.push('/admin/CreatePost')} />
        </View>
    )
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
        position: 'absolute',
        top: 50,
        left: 20,
    },
    button: {
        width: '80%',
        marginVertical: 10,
        marginBottom: 30
    }
});
