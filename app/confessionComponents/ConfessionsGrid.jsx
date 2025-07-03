import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  Modal,
  View,
} from 'react-native'
import { useState } from 'react'

import confessions from "@/data/confessions/postedConfessions.json"
import { confessionImageMap } from "@/app/(tabs)/confessions"
import { Colors } from '@/constants/Colors'

export default function ConfessionsGrid({ selectedResidence }) {
  const RES_CON_DATA = confessions[selectedResidence]
  const windowWidth = Math.floor(Dimensions.get('window').width)

  const numCols = 3
  const spacing = 1

  const baseSize = Math.floor(windowWidth / numCols)
  const leftover = windowWidth - baseSize * numCols 

 

  return (
    <View style={styles.container}>
      <Modal
        style={styles.allConfessionsScroller}
        >
          <AllConfessionsScroller RES_CON_DATA={RES_CON_DATA}/>
      </Modal>
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
    </View>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  allConfessionsScroller: {
    flex: 1,
  },
  grid: {
    flex: 1,
  }
})
