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
} from 'react-native'

import { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import ResidenceIcon from '@/assets/icons/ResidenceIcon'
import { Colors } from '@/constants/Colors';
import { api } from '@/context/DataContext'
import AnimateOpen from '@/app/AnimateOpen';

const data = [
  { label: 'Totem Park', residence: 'TotemPark' },
  { label: 'Orchard Commons', residence: 'OrchardCommons' },
  { label: 'Place Vanier', residence: 'PlaceVanier' }
];

const MAX_LENGTH_CONFESSION = 250

// -------- Objectionable content filtering (client-side) --------
const BLOCKLIST = [
  // Hate slurs (block both exact and common obfuscations)
  /\bnigg(a|er|@|4)\b/i,
  /\bfag(got)?\b/i,
  /\btrann?y\b/i,
  /\bkike\b/i,
  /\bchink\b/i,
  /\bspic\b/i,
  /\bretard(ed)?\b/i,

  // Extreme threats / violence (keep narrow)
  /\bshoot\s+up\b/i,
  /\bpipe\s*bomb\b/i,
  /\bkill\s+(you|him|her|them)\b/i,
  /\bstab\s+(you|him|her|them)\b/i,
  /\brape(s|d|ing)?\b/i,

  // Explicit sexual / illegal content
  /\bchild\s*porn\b/i,
  // /\bcp\b/i, // optional: catches "cp" shorthand; comment out if too strict
  /\bbestiality\b/i,
  /\bincest\b/i,
  /\bsend\s+nudes?\b/i,
];

function findBlockedTerm(input) {
  const text = (input || "").toLowerCase();
  for (let i = 0; i < BLOCKLIST.length; i++) {
    if (BLOCKLIST[i].test(text)) return true;
  }
  return false;
}


export default function AddConfessionScreen({ RES_CON_DATA }) {
  const [residence, setResidence] = useState(null);
  const [text, onChangeText] = useState('')
  const [errorMessage, setErrorMessage] = useState("")

  const submitConfession = async () => {
    try {
      const dayEventsRes = await api.post("/api/confessions", {
        residence: residence,
        content: text,
      });
      onChangeText('');
      setResidence(null);
      Alert.alert('Success', 'Your confession was submitted');
    } catch (err) {
      if (err.response) {
        console.error("❌ Confession upload, Server error:", err.response.data);
      } else {
        console.error("❌ Confession upload, Network or other error:", err.message);
      }
    }
  }

  const onPress = () => {
    if (residence === null) {
      setErrorMessage("*** Please select your residence ***")
      return;
    }
    if (text === '') {
      setErrorMessage("*** Confession can't be empty ***")
      return;
    }
    if (findBlockedTerm(trimmed)) {
      setErrorMessage(
        "*** Your confession contains disallowed content. Please remove objectionable terms (hate speech, explicit content, or serious violent threats). ***"
      );
      return;
    }
    setErrorMessage("")
    submitConfession()
  }


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
                activeColor='#1E5A8A'
                data={data}
                maxHeight={300}
                labelField="label"
                valueField="residence"
                placeholder="Select Residence"
                searchPlaceholder="Search..."
                value={residence}
                onChange={item => {
                  setResidence(item.residence);
                }}
                renderLeftIcon={() => (
                  <ResidenceIcon style={styles.residenceIcon} size={24} color='white' />
                )}

              />
              <Text style={styles.subheading}>Insert Confession Below</Text>
              <View>
                <TextInput
                  style={styles.confessionInput}
                  onChangeText={onChangeText}
                  multiline={true}
                  value={text}
                  placeholder='. . . . . . . . .'
                  placeholderTextColor={'#8C9AAE'}
                  textAlignVertical="top"
                  maxLength={MAX_LENGTH_CONFESSION}
                />
                <View style={styles.charCounterWrapper}>
                  <Text style={styles.charCounter}>{text.length}/{MAX_LENGTH_CONFESSION}</Text>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={onPress}
                >
                  <Text style={{
                    color: '#2C2C2C',
                    fontFamily: "RobotoBold",
                  }}>
                    Submit Confession
                  </Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                  Note: Your confession will be included in the next post, not immediately
                </Text>

                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AnimateOpen>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  placeholderStyle: {
    fontSize: 16,
    color: 'white',
    // paddingLeft: 30,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'white'
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  itemContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    border: 'none',
  },
  itemTextStyle: {
    color: 'white'
  },
  selectedStyle: {

  },
  subheading: {
    color: 'white',
    paddingLeft: 20,
    fontSize: 20,
    marginTop: 15,
  },
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
  charCounterWrapper: {
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  charCounter: {
    color: "white"
  },
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

})
