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

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles', 
  };

  return date.toLocaleString('en-CA', options);
}

export default function RenderedConfession({ confessionObj }) {
  const message = "Dump your intrusive thoughts, or confess something you would never have the balls to say in person."
  const anonymous  = "Submit your own anonymous confession on the"
  const anonymous2  = "First Year Life app on the App Store"
  const postSize = Dimensions.get('window').width;
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
          marginTop: 15,
          height: '36%',
          borderTopColor: Colors.confessions[confessionObj.residence].accent,
          borderTopWidth: 10,
        }]}>
          <Text style = {styles.heading}>{residence} Confessions</Text>
          <Text style = {styles.message}>{message}</Text>
          <Text style = {styles.anonymous}>{anonymous}</Text>
          <View style={{flexDirection: "row"}}>
          <Text style = {styles.anonymous2}>First Year Life</Text>
          <Text style = {styles.anonymous3}> app on the App Store</Text>
          </View>
          
        </View>
        <View style = {[styles.whiteBlock,
          {
          marginTop: 15,
          height: '52%',
        }
        ]}>
          <Text style = {styles.subheading}>Insert Confession Below</Text>
          <Text style = {styles.message}>{confessionObj.content}</Text>
        </View>
        <View style={{width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}>
          <Text style={styles.submittedAtText}>Submitted {formatConfessionTime(confessionObj.submittedAt)}</Text>
        </View>
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
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
    paddingBottom: 15,
  },
  subheading: {
    fontFamily: 'RobotoRegular',
    fontSize: 16,
    padding: 7, 
    paddingBottom: 7,
  },
  anonymous: {
    fontFamily: 'RobotoItalic',
    fontSize: 14,
    paddingLeft: 7,
    paddingRight: 7,
  },
  anonymous2: {
    fontFamily: 'RobotoSemiBoldItalic',
    fontSize: 14,
    paddingLeft: 7,
  },
  anonymous3: {
    fontFamily: 'RobotoItalic',
    fontSize: 14,
    paddingRight: 7,
  },
  submittedAtText: {
    color: 'gray',
    fontFamily: 'RobotoItalic',
    paddingTop: 5,
    fontSize: 11,
    paddingRight: 7
  },
})
