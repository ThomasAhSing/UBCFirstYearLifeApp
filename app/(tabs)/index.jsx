import { StyleSheet } from 'react-native';

import Heading from '../Heading';
import PostFlatList from '../PostFlatList';
import ScreenWrapper from '../ScreenWrapper';

export default function HomeScreen() {



  return (
    <ScreenWrapper>
        <Heading/>
        {/* <Text style={{color: 'white'}}>Home Screen</Text> */}
        <PostFlatList/>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  
});
