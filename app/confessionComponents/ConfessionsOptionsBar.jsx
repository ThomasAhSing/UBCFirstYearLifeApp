import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'
import { Colors } from "@/constants/Colors"

export default function ConfessionsOptionsBar({selectedResidence, setSelectedResidence}) {

    return (
        <View style = {styles.container}>
            <TouchableOpacity 
            style={[styles.resBtn, styles.totemUnselected, selectedResidence==="TotemPark" && styles.totemSelected]}
            onPress = {() => setSelectedResidence("TotemPark")}>
                <Text style={styles.resBtnText}>Totem</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
            style={[styles.resBtn, styles.orchardUnselected, selectedResidence==="OrchardCommons" && styles.orchardSelected]}
            onPress = {() => setSelectedResidence("OrchardCommons")}>
                <Text style={styles.resBtnText}>Orchard</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.resBtn, styles.vanierUnselected, selectedResidence==="PlaceVanier" && styles.vanierSelected]}
            onPress = {() => setSelectedResidence("PlaceVanier")}>
                <Text style={styles.resBtnText}>Vanier</Text>
            </TouchableOpacity>
        </View>    
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
    resBtn: {
        marginLeft: 7,
        marginRight: 7,
        borderWidth: 1,
        width: 75,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        
    },
    totemUnselected: {
        color: Colors.confessions.TotemPark.accent,
        borderColor: Colors.confessions.TotemPark.accent,
        backgroundColor: Colors.confessions.TotemPark.background,
    },
    totemSelected: {
        color: Colors.confessions.TotemPark.background,
        borderColor: Colors.confessions.TotemPark.accent,
        backgroundColor: Colors.confessions.TotemPark.accent,
    },
    orchardUnselected: {
        color: Colors.confessions.OrchardCommons.accent,
        borderColor: Colors.confessions.OrchardCommons.accent,
        backgroundColor: Colors.confessions.OrchardCommons.background,
    },
    orchardSelected: {
        color: Colors.confessions.OrchardCommons.background,
        borderColor: Colors.confessions.OrchardCommons.accent,
        backgroundColor: Colors.confessions.OrchardCommons.accent,
    },
    vanierUnselected: {
        color: Colors.confessions.PlaceVanier.accent,
        borderColor: Colors.confessions.PlaceVanier.accent,
        backgroundColor: Colors.confessions.PlaceVanier.background,
    },
    vanierSelected: {
        color: Colors.confessions.PlaceVanier.background,
        borderColor: Colors.confessions.PlaceVanier.accent,
        backgroundColor: Colors.confessions.PlaceVanier.accent,
    },
    resBtnText: {
        // color: 'white',
        fontFamily: 'InterSemiBold',
    },
})