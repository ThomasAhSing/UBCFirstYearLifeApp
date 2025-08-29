import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, Modal, Button, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import SettingsButton from '@/app/uiButtons/SettingsButton';
import { API_BASE } from '@/lib/config';

export default function Heading({title = "first year life"}) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [passcode, setPasscode] = useState('');
  const tapCount = useRef(0); 
  const lastTapTime = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 500) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;

    if (tapCount.current === 4) {
      tapCount.current = 0;
      setModalVisible(true); // Show passcode modal
    }
  };

  const checkPasscode = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/check-passcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();

      if (data.ok) {
        setModalVisible(false);
        setPasscode('');
        router.push('/admin/AdminDashboard');
        console.log('admin accessed');
      } else {
        Alert.alert('Incorrect passcode');
      }
    } catch (err) {
      Alert.alert('Server error');
    }
  };


  return (
    <View style={styles.container}>
      <Pressable style={styles.pressable} onPress={handleTap}>
        {/* <Text style={[styles.baseText, styles.mainHeading]}>first year life</Text> */}
        <Text style={[styles.baseText, styles.mainHeading]}>{title}</Text>
      </Pressable>
      <SettingsButton style={styles.settingsIcon} />
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>Enter Admin Passcode</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={passcode}
              onChangeText={setPasscode}
            />
            <Button title="Submit" onPress={checkPasscode} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    borderBottomColor: "#173E63",
    borderBottomWidth: 1,
  },
  settingsIcon: {
    marginRight: 10,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baseText: {
    color: 'white',
    fontFamily: 'CourgetteRegular',
  },
  mainHeading: {
    fontSize: 28,
    paddingLeft: 10,
    paddingRight: 10,
  },
  subHeading: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 250,
  },
  input: {
    borderBottomWidth: 1,
    marginVertical: 10,
    padding: 5,
  },
})
