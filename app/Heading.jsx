import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, Modal, Button, TextInput } from 'react-native';
// import { ADMIN_PASSCODE } from '@env';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';



export default function Heading() {
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

  const checkPasscode = () => {
    if (passcode === Constants.expoConfig.extra.ADMIN_PASSCODE) {
      setModalVisible(false);
      setPasscode('');
      router.push('/admin/AdminDashboard');

      console.log("admin accessed")
    } else {
      alert('Incorrect passcode');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.pressable} onPress={handleTap}>
        <Text style={[styles.baseText, styles.mainHeading]}>UBC</Text>
        <Text style={[styles.baseText, styles.subHeading]}>first year life</Text>
      </Pressable>
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
    borderBottomColor: "#173E63",
    borderBottomWidth: 1,
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
    fontSize: 30,
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
