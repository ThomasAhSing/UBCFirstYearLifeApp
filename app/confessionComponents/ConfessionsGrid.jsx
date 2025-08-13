import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  Modal,
  View,
  Text,
} from 'react-native'
import { useState, useEffect } from 'react'
import { Colors } from '@/constants/Colors'
import AllConfessionsScroller from './AllConfessionsScroller'
import BackIcon from '@/assets/icons/BackIcon'
import PlusIcon from '@/assets/icons/PlusIcon'
import AddConfessionScreen from './AddConfessionScreen'
import PreviewConfession from './PreviewConfession'
import { DataContext } from '@/context/DataContext';
import { useContext } from 'react';

// TODO implement gesture when when swipe right from left takes back from allscroller to previews

export default function ConfessionsGrid({ selectedResidence }) {
  const {
    postedConfessionsByResidence
  } = useContext(DataContext);
  
  const [screen, setScreen] = useState("preview")

  const windowWidth = Math.floor(Dimensions.get('window').width)
  const numCols = 3
  const spacing = 1
  const baseSize = Math.floor(windowWidth / numCols)
  const leftover = windowWidth - baseSize * numCols 

  const toggleAllConfessionsScroller = () => {
    if (screen === "preview") {
      setScreen("allConfessionsScroller")
    } else if (screen === "allConfessionsScroller") {
      setScreen("preview")
    }
  }

  const toggleAddConfession = () => { //return to preview if in addConfession
    if (screen !== "addConfession") {
      // prevScreen = screen
      setScreen("addConfession")
    } else if (screen === "addConfession") {
      setScreen("preview")
    }
  }

  return (
    <View style={styles.container}>
      
      {screen==="preview" && (
        <FlatList
      style = {styles.grid}
      data={postedConfessionsByResidence[selectedResidence]}
      numColumns={numCols}
      renderItem={({ item, index }) => {  // item is the inner list of confessions of same postID
        const col = index % numCols
        let itemWidth = baseSize

        if (col === 1) itemWidth += leftover

        return (
          <TouchableOpacity
          onPress={toggleAllConfessionsScroller}
            style={{
              width: itemWidth,
              height: baseSize,
              borderBottomWidth: spacing,
              borderRightWidth: col === numCols - 1 ? 0 : spacing,
              borderColor: Colors.background,
              backgroundColor: 'white',
            }}
          >
            <PreviewConfession style={{width: '100%', height: '100%'}} confessionObj = {item[0]}/>
          </TouchableOpacity>
        )
      }}
    />
      )}

      {screen==="allConfessionsScroller" && (
          <View style={styles.modal}>
          <TouchableOpacity style={{width: 40}} onPress={toggleAllConfessionsScroller}>
            <BackIcon  size={30} color='white'/>
          </TouchableOpacity>
          <AllConfessionsScroller style={styles.allConfessionsScroller} RES_CON_DATA={postedConfessionsByResidence[selectedResidence]}/>
        </View>
        
      )}

      {screen==="addConfession" && (
        <View style={styles.addConfessionScreen}>
          <TouchableOpacity onPress={toggleAddConfession}>
            <BackIcon size={30} color='white'/>
          </TouchableOpacity>
          <AddConfessionScreen/>
        </View>
      )}

      {screen !=="addConfession" && (
        <TouchableOpacity
        style={styles.addButton}
        onPress={toggleAddConfession}>
          <PlusIcon size={30} color='white'/>
        </TouchableOpacity>
      )}
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    backgroundColor: 'red',
    width: '100%',
    height: '100%'
  },
  modal: {
    height: '100%',
  },
  allConfessionsScroller: {
    flex: 1,
  },
  grid: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    height: 50,
    width: 50,
    backgroundColor: Colors.goldAccent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addConfessionScreen: {
    height: '100%',
  },
})
