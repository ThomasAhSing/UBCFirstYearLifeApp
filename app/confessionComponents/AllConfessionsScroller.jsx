import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
} from 'react-native'

import confessions from "@/data/confessions/postedConfessions.json"
import { confessionImageMap } from "@/app/(tabs)/confessions"
import { Colors } from '@/constants/Colors'
import ConfessionsSidercar from "./ConfessionsSidercar"

export default function AllConfessionsScroller({ RES_CON_DATA }) {
    return (
        <FlatList
                data={RES_CON_DATA}
                renderItem={({item}) => (
                    <ConfessionsSidercar confessions = {item.confessions}/>
                    // <FlatList
                    //     data={item.confessions}
                    //     renderItem={({item : confession}) => (

                    //     )}
                    // />
                )}
            
            />
    )
    

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
