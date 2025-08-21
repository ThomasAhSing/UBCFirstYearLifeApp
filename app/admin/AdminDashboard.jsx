import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity>

      {/* Main Action */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/admin/MarkEvents')}
      >
        <Text style={styles.buttonText}>📋 Mark Post as Events</Text>
      </TouchableOpacity>
    </View>
  );
}

const BLUE = '#1E88E5';
const LIGHT_BLUE = '#90CAF9';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: LIGHT_BLUE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  backText: {
    color: BLUE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: BLUE,
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginTop: 40,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
