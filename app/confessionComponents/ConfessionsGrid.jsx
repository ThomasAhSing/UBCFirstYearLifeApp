import { TouchableOpacity, StyleSheet, FlatList, Dimensions, View } from 'react-native'
import { useState, useContext, useEffect, useMemo } from 'react'
import { Colors } from '@/constants/Colors'
import AllConfessionsScroller from './AllConfessionsScroller'
import BackIcon from '@/assets/icons/BackIcon'
import PlusIcon from '@/assets/icons/PlusIcon'
import AddConfessionScreen from './AddConfessionScreen'
import PreviewConfession from './PreviewConfession'
import { DataContext } from '@/context/DataContext'
import { loadHiddenConfPostIds } from '@/app/utils/moderationStore'  // ⟵ only hidden IDs

export default function ConfessionsGrid({ selectedResidence, screen, setScreen, startIndex, setStartIndex }) {
  const { postedConfessionsByResidence } = useContext(DataContext);

  const [hiddenPostIds, setHiddenPostIds] = useState([]);

  // load on mount and when returning to preview
  useEffect(() => {
    (async () => setHiddenPostIds(await loadHiddenConfPostIds()))();
  }, []);
  useEffect(() => {
    if (screen === 'preview') {
      (async () => setHiddenPostIds(await loadHiddenConfPostIds()))();
    }
  }, [screen]);

  const windowWidth = Math.floor(Dimensions.get('window').width);
  const numCols = 3;
  const spacing = 1;
  const baseSize = Math.floor(windowWidth / numCols);
  const leftover = windowWidth - baseSize * numCols;

  const toggleAllConfessionsScroller = () => {
    setScreen(s => (s === 'preview' ? 'allConfessionsScroller' : 'preview'));
  };
  const toggleAddConfession = () => {
    setScreen(s => (s === 'addConfession' ? 'preview' : 'addConfession'));
  };

  const data = postedConfessionsByResidence[selectedResidence] || [];

  const getPostId = (group) => {
    const g0 = group?.[0] || {};
    return String(g0.postID ?? g0.postId ?? g0.post_id ?? g0.id ?? '');
  };

  // ✅ Only hide groups whose postID was hidden
  const filteredGroups = useMemo(() => {
    return (data || []).filter(group => {
      const pid = getPostId(group);
      return pid && !hiddenPostIds.includes(pid);
    });
  }, [data, hiddenPostIds]);

  const listData = filteredGroups.length ? filteredGroups : data; // safety fallback

  return (
    <View style={styles.container}>
      {screen === 'preview' && (
        <FlatList
          style={styles.grid}
          data={listData}
          numColumns={numCols}
          keyExtractor={(item, idx) => getPostId(item) || String(idx)}
          renderItem={({ item, index }) => {
            const col = index % numCols;
            let itemWidth = baseSize;
            if (col === 1) itemWidth += leftover;

            const preview = item?.[0]; // keep simple and robust

            if (!preview) {
              return (
                <View
                  style={{
                    width: itemWidth, height: baseSize,
                    borderBottomWidth: spacing,
                    borderRightWidth: col === numCols - 1 ? 0 : spacing,
                    borderColor: Colors.background,
                    backgroundColor: Colors.background,
                  }}
                />
              );
            }

            return (
              <TouchableOpacity
                onPress={() => { setStartIndex(index); setScreen('allConfessionsScroller'); }}
                style={{
                  width: itemWidth,
                  height: baseSize,
                  borderBottomWidth: spacing,
                  borderRightWidth: col === numCols - 1 ? 0 : spacing,
                  borderColor: Colors.background,
                  backgroundColor: 'white',
                }}
              >
                <PreviewConfession style={{ width: '100%', height: '100%' }} confessionObj={preview} />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {screen === 'allConfessionsScroller' && (
        <View style={styles.modal}>
          <TouchableOpacity style={{ width: 40 }} onPress={toggleAllConfessionsScroller}>
            <BackIcon size={30} color="white" />
          </TouchableOpacity>
          <AllConfessionsScroller
            style={styles.allConfessionsScroller}
            RES_CON_DATA={filteredGroups.length ? filteredGroups : data} // pass filtered
            initialIndex={startIndex}
          />
        </View>
      )}

      {screen === 'addConfession' && (
        <View style={styles.addConfessionScreen}>
          <TouchableOpacity onPress={toggleAddConfession}>
            <BackIcon size={30} color="white" />
          </TouchableOpacity>
          <AddConfessionScreen />
        </View>
      )}

      {screen !== 'addConfession' && (
        <TouchableOpacity style={styles.addButton} onPress={toggleAddConfession}>
          <PlusIcon size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modal: { height: '100%' },
  allConfessionsScroller: { flex: 1 },
  grid: { flex: 1 },
  addButton: {
    position: 'absolute', bottom: 30, right: 20, height: 50, width: 50,
    backgroundColor: Colors.goldAccent, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  addConfessionScreen: { height: '100%' },
});
