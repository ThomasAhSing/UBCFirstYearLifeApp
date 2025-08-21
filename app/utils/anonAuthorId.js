// utils/anonAuthorId.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'anonAuthorId';

export async function getOrCreateAnonAuthorId() {
  try {
    let id = await AsyncStorage.getItem(STORAGE_KEY);
    if (!id) {
      // Generate 16 random bytes → convert to hex string
      const randomBytes = await Crypto.getRandomBytesAsync(16);
      id = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      await AsyncStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch (err) {
    console.error("Failed to get or create anonAuthorId:", err);
    return null;
  }
}
