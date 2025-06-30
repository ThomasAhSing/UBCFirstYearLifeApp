import { View, Text, StyleSheet } from 'react-native'
import { useEffect } from 'react' 
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Heading()  {

  const [loaded, error] = useFonts({
    'Courgette-Regular': require('../assets/fonts/Courgette-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <View style = {styles.container}>
      <Text style = {[styles.baseText, styles.mainHeading]}>UBC</Text>
      <Text style = {[styles.baseText, styles.subHeading]}>first year life</Text>
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
  baseText: {
    color: 'white',
    fontFamily: 'Courgette-Regular',
  },
  mainHeading: {
    fontSize: 30,
    paddingLeft: 10,
    paddingRight: 10,
  },
  subHeading: {
    fontSize: 18,
    // paddingLeft: 10,
  }
})
