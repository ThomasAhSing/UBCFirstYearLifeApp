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
import { GestureDetector } from 'react-native-gesture-handler'

import confessions from "@/data/confessions/postedConfessions.json"
import { confessionImageMap } from "@/app/(tabs)/confessions"
import { Colors } from '@/constants/Colors'
import AllConfessionsScroller from './AllConfessionsScroller'
import BackIcon from '@/assets/icons/BackIcon'
import PlusIcon from '@/assets/icons/PlusIcon'
import AddConfessionScreen from './AddConfessionScreen'
import PreviewConfession from './PreviewConfession'

import axios from 'axios'

// TODO implement gesture when when swipe right from left takes back from allscroller to previews
// TODO add opening on crrect index not at start when click on preview

function formatFetchedData(fetchedConfessions = []) {
  const grouped = {};
  for (const conf of fetchedConfessions) {
    if (!grouped[conf.postID]) {
      grouped[conf.postID] = [];
    }
    grouped[conf.postID].push(conf);
  }

  // Step 2: Sort postIDs descending
  const sortedPostIDs = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  // Step 3: For each postID, sort its confessions by confessionIndex ascending
  const result = sortedPostIDs.map(postID =>
    grouped[postID].sort((a, b) => a.confessionIndex - b.confessionIndex)
  );

  return result;
}

export default function ConfessionsGrid({ selectedResidence }) {
  // const RES_CON_DATA = confessions[selectedResidence]
  
  const [postedConfessionsData, setPostedConfessionsData] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchPostedConfessionsData = async () => {
        try {
          const res = await axios.get(`http://localhost:10000/api/confessions/posted?residence=${selectedResidence}`)
          // console.log("res data")
          // console.log(res)
          // console.log(res.data)
          setPostedConfessionsData(formatFetchedData(res.data));
        } catch (err) {
          console.error('Failed to fetch posted confessions:', err);
        } finally {
          setLoading(false);
        }
      }
      fetchPostedConfessionsData();
  }, [selectedResidence]);
  // let prevScreen = "preview"
  const [screen, setScreen] = useState("preview")

  if (loading) return <Text style={{color: 'white'}}>Loading...</Text>;
  console.log(postedConfessionsData)

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
      // data={RES_CON_DATA}
      data={postedConfessionsData}
      numColumns={numCols}
      // keyExtractor={(item) => item[0].postId.toString()}
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
            {/* <Image
              source={confessionImageMap[selectedResidence][item.postId]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            /> */}
            {/* <View style={styles.preview}></View>   */}
            <PreviewConfession style={{width: '100%', height: '100%'}} confessionObj = {item[0]}/>
          </TouchableOpacity>
        )
      }}
    />
      )}

      {screen==="allConfessionsScroller" && (
        // <GestureDetector onGestureEvent={handleGestureEvent}>
          <View style={styles.modal}>
          <TouchableOpacity onPress={toggleAllConfessionsScroller}>
            <BackIcon size={30} color='white'/>
          </TouchableOpacity>
          {/* <AllConfessionsScroller style={styles.allConfessionsScroller} RES_CON_DATA={RES_CON_DATA}/> */}
          <AllConfessionsScroller style={styles.allConfessionsScroller} RES_CON_DATA={postedConfessionsData}/>
        </View>
        // </GestureDetector>
        
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

// export default function ConfessionsGrid({ selectedResidence }) {
//   const RES_CON_DATA = confessions[selectedResidence]
  
//   const windowWidth = Math.floor(Dimensions.get('window').width)

//   const numCols = 3
//   const spacing = 1

//   const baseSize = Math.floor(windowWidth / numCols)
//   const leftover = windowWidth - baseSize * numCols 

//   // let prevScreen = "preview"
//   const [screen, setScreen] = useState("preview")


//   const toggleAllConfessionsScroller = () => {
//     if (screen === "preview") {
//       setScreen("allConfessionsScroller")
//     } else if (screen === "allConfessionsScroller") {
//       setScreen("preview")
//     }
//   }

//   const toggleAddConfession = () => { //return to preview if in addConfession
//     if (screen !== "addConfession") {
//       // prevScreen = screen
//       setScreen("addConfession")
//     } else if (screen === "addConfession") {
//       setScreen("preview")
//     }
//   }



//   return (
//     <View style={styles.container}>
      

//       {screen==="preview" && (
//         <FlatList
//       style = {styles.grid}
//       data={RES_CON_DATA}
//       numColumns={numCols}
//       keyExtractor={(item) => item.postId.toString()}
//       renderItem={({ item, index }) => {
//         const col = index % numCols
//         let itemWidth = baseSize

//         if (col === 1) itemWidth += leftover

//         return (
//           <TouchableOpacity
//           onPress={toggleAllConfessionsScroller}
//             style={{
//               width: itemWidth,
//               height: baseSize,
//               borderBottomWidth: spacing,
//               borderRightWidth: col === numCols - 1 ? 0 : spacing,
//               borderColor: Colors.background,
//               backgroundColor: 'white',
//             }}
//           >
//             <Image
//               source={confessionImageMap[selectedResidence][item.postId]}
//               style={{ width: '100%', height: '100%' }}
//               resizeMode="cover"
//             />
//           </TouchableOpacity>
//         )
//       }}
//     />
//       )}

//       {screen==="allConfessionsScroller" && (
//         // <GestureDetector onGestureEvent={handleGestureEvent}>
//           <View style={styles.modal}>
//           <TouchableOpacity onPress={toggleAllConfessionsScroller}>
//             <BackIcon size={30} color='white'/>
//           </TouchableOpacity>
//           <AllConfessionsScroller style={styles.allConfessionsScroller} RES_CON_DATA={RES_CON_DATA}/>
//         </View>
//         // </GestureDetector>
        
//       )}

//       {screen==="addConfession" && (
//         <View style={styles.addConfessionScreen}>
//           <TouchableOpacity onPress={toggleAddConfession}>
//             <BackIcon size={30} color='white'/>
//           </TouchableOpacity>
//           <AddConfessionScreen/>
          
//         </View>


        
//       )}

//       {screen !=="addConfession" && (
//         <TouchableOpacity
//         style={styles.addButton}
//         onPress={toggleAddConfession}>
//           <PlusIcon size={30} color='white'/>
//         </TouchableOpacity>
//       )}
      
//     </View>
    
//   )
// }

