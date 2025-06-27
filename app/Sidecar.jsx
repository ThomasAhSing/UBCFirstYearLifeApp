import {FlatList, StyleSheet, Text, View} from 'react-native'
import {imageMap} from './Post'



export default function Sidecar({post}) {
    

    return (
        <View style={styles.contaienr}>
            <FlatList
                data = {[1, 2, 3, 4]}
                renderItem = {({item}) => <Text>item</Text>}
                horizontal = {true}
            />
        </View>
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})