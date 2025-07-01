import { TouchableOpacity, StyleSheet, Text, View, Image, FlatList } from 'react-native'


import { Colors } from "@/constants/Colors"
import confessions from "@/data/confessions/postedConfessions.json"
 
export default function ConfessionsGrid({selectedResidence, setSelectedResidence}) {
    const RES_CON_DATA = confessions[selectedResidence] // list of post jsons
    return (
          <FlatList
          data={RES_CON_DATA}
          renderItem={({item}) => {
            <TouchableOpacity >
                <Image></Image>
            </TouchableOpacity>
          }}/>
    )

}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
        padding: 10,
    },
})