import {
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  View,
  Text,
} from 'react-native'


import { Colors } from '@/constants/Colors'

export default function PreviewConfession({ confessionObj, style }) {
  // console.log('confobj')
  // console.log(confessionObj.residence)
  const message = "Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person."
  const anonymous  = "All confessions are anonymous."
  const postSize = Dimensions.get('window').width;
  const residence = confessionObj.residence.replace(/([a-z])([A-Z])/g, '$1 $2')
    return (
      <View style={
        [{
          width: postSize, 
          height: postSize, 
          backgroundColor: Colors.confessions[confessionObj.residence].background,
          alignItems: 'center',
        }, style]
        }>
        <View style = {[styles.whiteBlock, 
        {
          marginTop: 5,
          height: '32%',
          borderTopColor: Colors.confessions[confessionObj.residence].accent,
          borderTopWidth: 4,
        }]}>
          <Text style = {styles.heading}>{residence} Confessions</Text>
          <Text style = {styles.message}>{message}</Text>
          <Text style = {styles.anonymous}>{anonymous}</Text>
        </View>
        <View style = {[styles.whiteBlock,
          {
          marginTop: 4,
          height: '50%',
        }
        ]}>
          <Text style = {styles.subheading}>Insert Confession Below</Text>
          <Text style = {styles.message}>{confessionObj.content}</Text>
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
    width: '88%',
    backgroundColor: 'white',
    borderRadius: 6,
  },
  heading: {
    fontFamily: 'RobotoRegular',
    fontSize: 6,
    padding: 2, 
  },
  message: {
    fontFamily: 'RobotoRegular',
    fontSize: 4,
    paddingLeft: 2,
    paddingRight: 3,
    paddingBottom: 2,
  },
  subheading: {
    fontFamily: 'RobotoRegular',
    fontSize: 4,
    padding: 2, 
    paddingBottom: 3,
  },
  anonymous: {
    fontFamily: 'RobotoItalic',
    fontSize: 3,
    paddingLeft: 2,
    paddingRight: 2,
  },
})
