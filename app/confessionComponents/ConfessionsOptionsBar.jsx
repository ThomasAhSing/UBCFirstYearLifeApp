import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'
// import { useEffect } from 'react'


import { Colors } from "@/constants/Colors"

 
export default function ConfessionsOptionsBar({selectedResidence, setSelectedResidence}) {

    return (
        <View style = {styles.container}>
            <TouchableOpacity 
            style={[styles.resBtn, styles.totemUnselected, selectedResidence==="Totem Park" && styles.totemSelected]}
            onPress = {() => setSelectedResidence("Totem Park")}>Totem</TouchableOpacity>
            
            <TouchableOpacity 
            style={[styles.resBtn, styles.orchardUnselected, selectedResidence==="Orchard Commons" && styles.orchardSelected]}
            onPress = {() => setSelectedResidence("Orchard Commons")}>Orchard</TouchableOpacity>
            <TouchableOpacity
            style={[styles.resBtn, styles.vanierUnselected, selectedResidence==="Place Vanier" && styles.vanierSelected]}
            onPress = {() => setSelectedResidence("Place Vanier")}>Vanier</TouchableOpacity>
        </View>    
    )

}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignContent: 'center',
    },
    resBtn: {
        color: 'white',
        marginLeft: 10,
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
})