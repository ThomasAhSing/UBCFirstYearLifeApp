import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native'
import { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import ResidenceIcon from '@/assets/icons/ResidenceIcon'
import { Colors } from '@/constants/Colors';
import axios from 'axios';

const data = [
  { label: 'Totem Park', residence: 'TotemPark' },
  { label: 'Orchard Commons', residence: 'OrchardCommons' },
  { label: 'Place Vanier', residence: 'PlaceVanier' }
];



// TODO abstarct post with like abr and everythong to take a sidecar 
// TODO add gestures to close keybaord

export default function AddConfessionScreen({ RES_CON_DATA }) {
  const [residence, setResidence] = useState(null);
  const [text, onChangeText] = useState('')
  const [height, setHeight] = useState(40)
  const [errorMessage, setErrorMessage] = useState("")

  const submitConfession = async () => {
    console.log("submitted confession")
    try {
      const dayEventsRes = await axios.post("http://localhost:10000/api/confessions", {
        residence: residence,
        content: text,
      });
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
    setErrorMessage("")
    submitConfession()
  }

  // console.log(residence)
  return (
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
          style={[styles.confessionInput, { height }]}
          onChangeText={onChangeText}
          multiline={true}
          value={text}
          placeholder='. . . . . . . . .'
          placeholderTextColor={'#8C9AAE'}
          onContentSizeChange={(e) =>
            setHeight(e.nativeEvent.contentSize.height)
          }
          textAlignVertical="top"
        />
        <View style={styles.charCounterWrapper}>
          <Text style={styles.charCounter}>3/10</Text>
        </View>
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

  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center'
  },
  dropdownContaienr: {
    // backgroundColor: 'transparent',
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
    paddingLeft: 15,
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
    height: 40,
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
