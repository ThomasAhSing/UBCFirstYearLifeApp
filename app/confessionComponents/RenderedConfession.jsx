import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  View,
  Text,
} from 'react-native'


import { Colors } from '@/constants/Colors'

export default function RenderedConfession({ confessionObj }) {
  // console.log('confobj')
  // console.log(confessionObj.residence)
  const postSize = Dimensions.get('window').width;
    return (
      <View style={
        {
          width: postSize, 
          height: postSize, 
          backgroundColor: Colors.confessions[confessionObj.residence].background,
          alignItems: 'center',
        }
        }>
        <View style = {[styles.whiteBlock, 
        {
          marginTop: 20,
          height: '30%',
          borderTopColor: Colors.confessions[confessionObj.residence].accent,
          borderTopWidth: 10,
        }]}>

        </View>
        <View style = {[styles.whiteBlock,
          {
          marginTop: 10,
          height: '30%',
        }
        ]}>

        </View>
      </View>
    )
    

}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    // backgroundColor: Colors.background
    backgroundColor: 'red'
  }, 
  whiteBlock: {
    width: '50%',
    backgroundColor: 'white',
    borderRadius: 10,
  },
})
