// app/confessions/AddConfessionScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import ResidenceIcon from '@/assets/icons/ResidenceIcon';
import { Colors } from '@/constants/Colors';
import { api } from '@/context/DataContext';
import AnimateOpen from '@/app/AnimateOpen';
import { getOrCreateAnonAuthorId } from '@/app/utils/anonAuthorId';

const data = [
  { label: 'Totem Park', residence: 'TotemPark' },
  { label: 'Orchard Commons', residence: 'OrchardCommons' },
  { label: 'Place Vanier', residence: 'PlaceVanier' },
];

const MAX_LENGTH_CONFESSION = 250;

// -------- Objectionable content filtering (client-side) --------
const BLOCKLIST = [
  // Hate slurs (block both exact and common obfuscations)
  /\bnigg(a|er|@|4)\b/i,
  /\bfag(got)?\b/i,
  /\btrann?y\b/i,
  /\bkike\b/i,
  /\bchink\b/i,

  // Extreme threats / violence (keep narrow)
  /\brape(s|d|ing)?\b/i,

  // Explicit sexual / illegal content
  /\bchild\s*porn\b/i,
  // /\bcp\b/i, // optional: catches "cp" shorthand; comment out if too strict
  /\bbestiality\b/i,
  /\bincest\b/i,
];

function containsBlockedTerm(input) {
  const text = String(input || '').toLowerCase();
  for (let i = 0; i < BLOCKLIST.length; i++) {
    if (BLOCKLIST[i].test(text)) return true;
  }
  return false;
}

export default function AddConfessionScreen() {
  const [residence, setResidence] = useState(null);
  const [text, onChangeText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [authorId, setAuthorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load or create per-install anonymous author id
  useEffect(() => {
    (async () => {
      const id = await getOrCreateAnonAuthorId();
      setAuthorId(id);
    })();
  }, []);

  const submitConfession = async () => {
    try {
      setSubmitting(true);
      await api.post('/api/confessions', {
        residence,
        content: text,
        submittedFrom: authorId, // ← include stable anon author id
      });
      onChangeText('');
      setResidence(null);
      Alert.alert('Success', 'Your confession was submitted');
    } catch (err) {
      if (err?.response) {
        console.error('❌ Confession upload, Server error:', err.response.data);
        Alert.alert('Error', err.response.data?.message || 'Server error.');
      } else {
        console.error('❌ Confession upload, Network or other error:', err?.message);
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onPress = () => {
    const trimmed = text.trim();
      console.log(authorId)

    if (residence === null) {
      setErrorMessage('*** Please select your residence ***');
      return;
    }
    if (!trimmed) {
      setErrorMessage("*** Confession can't be empty ***");
      return;
    }
    if (!authorId) {
      setErrorMessage('*** Initializing… please try again in a moment ***');
      return;
    }
    if (containsBlockedTerm(trimmed)) {
      setErrorMessage(
        '*** Your confession contains disallowed content. Please remove objectionable terms (hate speech, explicit content, or serious violent threats). ***'
      );
      return;
    }

    setErrorMessage('');
    if (!submitting) submitConfession();
  };

  return (
    <AnimateOpen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                itemContainerStyle={styles.itemContainer}
                containerStyle={styles.dropdownContaienr}
                itemTextStyle={styles.itemTextStyle}
                selectedStyle={styles.selectedStyle}
                activeColor="#1E5A8A"
                data={data}
                maxHeight={300}
                labelField="label"
                valueField="residence"
                placeholder="Select Residence"
                searchPlaceholder="Search..."
                value={residence}
                onChange={item => setResidence(item.residence)}
                renderLeftIcon={() => (
                  <ResidenceIcon style={styles.residenceIcon} size={24} color="white" />
                )}
              />

              <Text style={styles.subheading}>Insert Confession Below</Text>

              <View>
                <TextInput
                  style={styles.confessionInput}
                  onChangeText={onChangeText}
                  multiline
                  value={text}
                  placeholder=". . . . . . . . ."
                  placeholderTextColor={'#8C9AAE'}
                  textAlignVertical="top"
                  maxLength={MAX_LENGTH_CONFESSION}
                  editable={!submitting}
                />

                <View style={styles.charCounterWrapper}>
                  <Text style={styles.charCounter}>
                    {text.length}/{MAX_LENGTH_CONFESSION}
                  </Text>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={onPress} disabled={submitting}>
                  <Text style={{ color: '#2C2C2C', fontFamily: 'RobotoBold' }}>
                    {submitting ? 'Submitting…' : 'Submit Confession'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                  Note: Your confession will be included in the next post, not immediately
                </Text>

                {!!errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AnimateOpen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dropdownContaienr: {
    backgroundColor: '#2B4C65',
    borderWidth: 0,
    borderRadius: 10,
  },
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomWidth: 0.5,
    backgroundColor: '#133A5D',
    borderRadius: 30,
    width: '80%',
  },
  residenceIcon: {
    paddingLeft: 50,
    marginRight: 7,
  },
  placeholderStyle: { fontSize: 16, color: 'white' },
  selectedTextStyle: { fontSize: 16, color: 'white' },
  iconStyle: { width: 20, height: 20, marginRight: 15 },
  itemContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    border: 'none',
  },
  itemTextStyle: { color: 'white' },
  selectedStyle: {},
  subheading: { color: 'white', paddingLeft: 20, fontSize: 20, marginTop: 15 },
  confessionInput: {
    height: 150,
    margin: 12,
    borderWidth: 1,
    padding: 15,
    color: 'white',
    fontSize: 15,
    border: 'none',
    marginTop: 15,
  },
  charCounterWrapper: { alignItems: 'flex-end', paddingRight: 20 },
  charCounter: { color: 'white' },
  submitBtn: {
    backgroundColor: Colors.goldAccent,
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 25,
  },
  note: {
    fontFamily: 'RobotoItalic',
    color: 'white',
    fontSize: 12,
    paddingLeft: 15,
    marginTop: 15,
  },
  errorMessage: {
    color: '#ff4d4d',
    fontStyle: 'italic',
    marginTop: 15,
    marginLeft: 15,
  },
});