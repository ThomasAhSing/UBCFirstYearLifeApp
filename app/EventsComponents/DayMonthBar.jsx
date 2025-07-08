import {
    Text,
    View,
    StyleSheet,

} from 'react-native'
import { useState } from 'react';

import SegmentedControl from '@react-native-segmented-control/segmented-control';

const VIEW_MODES = ['Day', 'Month']


export default function DayMonthBar({ viewMode, setViewMode }) {

    const selectedIndex = VIEW_MODES.indexOf(viewMode)
    // console.log(viewMode)

    return (
        <View style={styles.container}>
            <SegmentedControl
                style={styles.slider}
                values={VIEW_MODES}
                selectedIndex={selectedIndex}
                backgroundColor='#2B4C65'
                tintColor='#1E5A8A'
                onChange={(event) => {
                    const index = event.nativeEvent.selectedSegmentIndex
                    setViewMode(VIEW_MODES[index]);
                }}
            />
        </View>
    );

    

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    text: {
        color: 'white'
    },
    slider: {
        width: '40%',
    },
})
