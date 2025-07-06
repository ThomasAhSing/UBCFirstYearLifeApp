import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  Text,
  View,
  TextInput
} from 'react-native'
import { useState } from 'react'
  import { Dropdown } from 'react-native-element-dropdown';
import ResidenceIcon from '@/assets/icons/ResidenceIcon'

    const data = [
    { label: 'Totem Park', residence: 'TotemPark' },
    { label: 'Orchard Commons', residence: 'OrchardCommons' },
    { label: 'Place Vanier', residence: 'PlaceVanier' }
  ];

export default function AddConfessionScreen({ RES_CON_DATA }) {
  const [residence, setResidence] = useState(null);
  const [text, onChangeText] = useState('')
  const [height, setHeight] = useState(40)
    // console.log(residence)
    return (
      <View style={styles.container}>
        <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        itemContainerStyle = {styles.itemContainer}
        containerStyle = {styles.dropdownContaienr}
        itemTextStyle = {styles.itemTextStyle}
        selectedStyle = {styles.selectedStyle}
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
            <ResidenceIcon style = {styles.residenceIcon} size={24} color='white'/>
          )}
          
      />
      <Text style={styles.subheading}>Insert Confession Below</Text>
      <View>
          <TextInput
          style={[styles.confessionInput, { height}]}
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
        <View style = {styles.charCounterWrapper}>
          <Text style={styles.charCounter}>3/10</Text>
        </View>
        
      </View>
      
      </View>
      
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center'
  },
  dropdownContaienr: {
    backgroundColor: 'transparent',

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
      backgroundColor: '#2B4C65',
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
    },
    confessionInput: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 15,
      color: 'white',
      fontSize: 15,
      border: 'none',
    },
    charCounterWrapper: {
      alignItems: 'flex-end',
      paddingRight: 20,
    },
    charCounter: {

    }

})
