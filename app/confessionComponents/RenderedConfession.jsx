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

function formatConfessionTime(isoString) {
  const date = new Date(isoString);

  // Adjust to local time (if needed, change timeZone)
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles', // Change if needed
  };

  return date.toLocaleString('en-CA', options);
}

export default function RenderedConfession({ confessionObj }) {
  // console.log('confobj')
  // console.log(confessionObj.residence)
  const message = "Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person."
  const anonymous  = "All confessions are anonymous."
  const postSize = Dimensions.get('window').width;
  console.log(confessionObj.submittedAt)
  console.log((typeof confessionObj.submittedAt))
  const residence = confessionObj.residence.replace(/([a-z])([A-Z])/g, '$1 $2')
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
          marginTop: 28,
          height: '32%',
          borderTopColor: Colors.confessions[confessionObj.residence].accent,
          borderTopWidth: 10,
        }]}>
          <Text style = {styles.heading}>{residence} Confessions</Text>
          <Text style = {styles.message}>{message}</Text>
          <Text style = {styles.anonymous}>{anonymous}</Text>
        </View>
        <View style = {[styles.whiteBlock,
          {
          marginTop: 15,
          height: '50%',
        }
        ]}>
          <Text style = {styles.subheading}>Insert Confession Below</Text>
          <Text style = {styles.message}>{confessionObj.content}</Text>
        </View>
        <View style={{width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}>
          <Text style={styles.submittedAtText}>Submitted 
            {formatConfessionTime(confessionObj.submittedAt)}</Text>
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
    borderRadius: 10,
  },
  heading: {
    fontFamily: 'RobotoRegular',
    fontSize: 20,
    padding: 7, 
  },
  message: {
    fontFamily: 'RobotoRegular',
    fontSize: 14,
    paddingLeft: 7,
    paddingRight: 7,
    paddingBottom: 5,
  },
  subheading: {
    fontFamily: 'RobotoRegular',
    fontSize: 16,
    padding: 7, 
    paddingBottom: 10,
  },
  anonymous: {
    fontFamily: 'RobotoItalic',
    fontSize: 14,
    paddingLeft: 7,
    paddingRight: 7,
  },
  submittedAtText: {
    color: 'gray'
  },
})
