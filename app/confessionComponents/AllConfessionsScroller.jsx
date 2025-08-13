import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  View
} from 'react-native'


import ConfessionsPost from "./ConfessionsPost"

export default function AllConfessionsScroller({ RES_CON_DATA }) {
  return (
    <FlatList
      data={RES_CON_DATA}
      renderItem={({ item }) => (
        // <ConfessionsPost confessions = {item.confessions}/>
        <View>
          <ConfessionsPost confessions={item} />
        </View>

      )}

    />
  )


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
