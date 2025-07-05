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
import { useState } from 'react'
import { GestureDetector } from 'react-native-gesture-handler'

import confessions from "@/data/confessions/postedConfessions.json"
import { confessionImageMap } from "@/app/(tabs)/confessions"
import { Colors } from '@/constants/Colors'
import AllConfessionsScroller from './AllConfessionsScroller'
import BackIcon from '@/assets/icons/BackIcon'
import PlusIcon from '@/assets/icons/PlusIcon'

// TODO implement gesture when when swipe right from left takes back from allscroller to previews
// TODO add opening on crrect index not at start when click on preview
export default function ConfessionsGrid({ selectedResidence }) {
  const RES_CON_DATA = confessions[selectedResidence]
  const windowWidth = Math.floor(Dimensions.get('window').width)

  const numCols = 3
  const spacing = 1

  const baseSize = Math.floor(windowWidth / numCols)
  const leftover = windowWidth - baseSize * numCols 

  const [modalVisible, setModalVisible] = useState(false); 
  const toggleModalVisible = () => {
    setModalVisible(!modalVisible)
  }

  const handleGestureEvent = (event) => {
  if (event.nativeEvent.translationX > windowWidth * 0.2) { 
    setModalVisible(false)
  }
  };

  return (
    <View style={styles.container}>
      

      {!modalVisible && (
        <FlatList
      style = {styles.grid}
      data={RES_CON_DATA}
      numColumns={numCols}
      keyExtractor={(item) => item.postId.toString()}
      renderItem={({ item, index }) => {
        const col = index % numCols
        let itemWidth = baseSize

        if (col === 1) itemWidth += leftover

        return (
          <TouchableOpacity
          onPress={toggleModalVisible}
            style={{
              width: itemWidth,
              height: baseSize,
              borderBottomWidth: spacing,
              borderRightWidth: col === numCols - 1 ? 0 : spacing,
              borderColor: Colors.background,
              backgroundColor: 'white',
            }}
          >
            <Image
              source={confessionImageMap[selectedResidence][item.postId]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )
      }}
    />
      )}

      {modalVisible && (
        // <GestureDetector onGestureEvent={handleGestureEvent}>
          <View style={styles.modal}>
          <TouchableOpacity onPress={toggleModalVisible}>
            <BackIcon size={30} color='white'/>
          </TouchableOpacity>
          <AllConfessionsScroller style={styles.allConfessionsScroller} RES_CON_DATA={RES_CON_DATA}/>
        </View>
        // </GestureDetector>
        
      )}

      <TouchableOpacity style={styles.addButton}>
        <PlusIcon size={30} color='white'/>
      </TouchableOpacity>
    </View>
    
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
})
