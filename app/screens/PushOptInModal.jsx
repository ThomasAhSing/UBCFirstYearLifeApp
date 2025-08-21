// app/screens/PushOptInModal.jsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';

export default function PushOptInModal({
  visible,
  onEnable,
  onClose,
  loading = false,
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={{ alignItems: 'center', marginBottom: 14 }}>
            <Image
              source={{
                uri:
                  'https://firebasestorage.googleapis.com/v0/b/ubcfirstyearlifeapp.firebasestorage.app/o/ubcfyla_app_icon.png?alt=media&token=32f2af08-3064-4315-8a5c-e1d9afa88355',
              }}
              style={{
                width: 84,
                height: 84,
                borderRadius: 20,
                marginBottom: 10,
              }}
              resizeMode="cover"
            />
            <Text style={styles.title}>Don’t miss out on what's happening in res</Text>
            <Text style={styles.body}>
              Turn on notifications to get the latest confessions right when they drop.
            </Text>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.8}
              style={[styles.btn, styles.btnGhost]}
            >
              <Text style={styles.btnGhostText}>Not now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onEnable}
              disabled={loading}
              activeOpacity={0.9}
              style={[styles.btn, styles.btnPrimary]}
            >
              {loading ? (
                <ActivityIndicator color="#0C2A42" />
              ) : (
                <Text style={styles.btnPrimaryText}>
                  Turn on notifications
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.background, // deep navy from your scheme
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#173E63',
  },
  title: { fontSize: 20, fontWeight: '700', color: 'white', marginBottom: 8, textAlign: 'center'},
  body: {
    fontSize: 14,
    color: '#D6E4F0', // softer blue-gray text
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  btnGhost: { borderWidth: 1, borderColor: '#295782' },
  btnGhostText: { color: '#C6DAF3', fontWeight: '600' },
  btnPrimary: { backgroundColor: Colors.goldAccent },
  btnPrimaryText: { color: '#0C2A42', fontWeight: '700' },
});
