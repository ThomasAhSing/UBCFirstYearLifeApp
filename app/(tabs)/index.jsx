import { StyleSheet, View, Text } from 'react-native';

import Heading from '../Heading';
import PostFlatList from '../PostFlatList';
import ScreenWrapper from '../ScreenWrapper';

export default function HomeScreen() {

// TODO add double tap image to like 

  return (
    <ScreenWrapper>
        <Heading/>
        {/* <Text style={{color: 'white'}}>Home Screen</Text> */}
        <PostFlatList/>
    </ScreenWrapper>
    // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //   <Text>✅ Minimal screen works</Text>
    // </View>
  );
}

const styles = StyleSheet.create({
  
});
