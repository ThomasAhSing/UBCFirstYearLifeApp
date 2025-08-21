import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

export default function ReportPrompt({ visible, onCancel, onSubmit }) {
  const [reason, setReason] = useState('');

  const handleSend = () => {
    const r = reason.trim();
    onSubmit?.(r);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel?.();
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Report post</Text>
          <Text style={styles.label}>Reason for report</Text>
          <Text style={styles.label}>For more detailed reports, you can directly email ahsingthomas@gmail.com</Text>
          <TextInput    
            style={styles.input}
            placeholder="Tell us what's wrong..."
            placeholderTextColor="#99A"
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.ghost]} onPress={handleCancel}>
              <Text style={styles.ghostText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.solid, !reason.trim() && { opacity: 0.6 }]}
              onPress={handleSend}
              disabled={!reason.trim()}
            >
              <Text style={styles.solidText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#0c2538', borderRadius: 16, padding: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { color: '#cfe3ff', marginBottom: 6 },
  input: {
    minHeight: 90, backgroundColor: '#0f2941', color: '#fff',
    borderRadius: 10, padding: 10,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2a4d70' },
  solid: { backgroundColor: '#e9c46a' },
  ghostText: { color: '#cfe3ff', fontWeight: '700' },
  solidText: { color: '#2c2c2c', fontWeight: '700' },
});
