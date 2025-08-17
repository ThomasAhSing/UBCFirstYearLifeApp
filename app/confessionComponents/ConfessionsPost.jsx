import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'; // ✅ NEW
import { toggleLikedByKey } from '@/app/lib/likes'; // same as before
import RenderedConfession from './RenderedConfession';
import PostUIBar from '@/app/HomeComponents/PostUIBar';

export default function ConfessionsPost({ confessions = [] }) {
  const postSize = Dimensions.get('window').width;
  const listRef = useRef(null);

  const first = confessions[0] || {};
  const groupResidence = first.residence ?? first.Residence ?? first.res ?? '';
  const groupPostId    = String(first.postId ?? first.postID ?? first.post_id ?? first.id ?? '');
  const groupKey       = `${groupResidence}:${groupPostId}`;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex?.({ index: 0, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, [groupKey]);

  useEffect(() => {
    if (!confessions.length) { setCurrentIndex(0); return; }
    if (currentIndex > confessions.length - 1) setCurrentIndex(confessions.length - 1);
  }, [confessions.length]);

  const onScroll = useCallback((e) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.max(0, Math.min(confessions.length - 1, Math.floor((x + postSize / 2) / postSize)));
    if (idx !== currentIndex) setCurrentIndex(idx);
  }, [confessions.length, postSize, currentIndex]);

  const onScrollToIndexFailed = (info) => {
    setTimeout(() => {
      listRef.current?.scrollToIndex?.({ index: info.index, animated: false });
    }, 0);
  };

  const current = confessions[currentIndex] || {};

  const onDoubleTap = useCallback(async () => {
    if (!groupResidence || !groupPostId) return;
    await toggleLikedByKey(`conf:${groupResidence}:${groupPostId}`);
  }, [groupResidence, groupPostId]);

  // ✅ New gesture (double tap on list area)
  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .onEnd((_e, success) => {
          if (success) onDoubleTap();
        }),
    [onDoubleTap]
  );

  return (
    <View key={groupKey}>
      {/* ✅ Wrap list with GestureDetector */}
      <GestureDetector gesture={doubleTap}>
        <View>
          <FlatList
            key={groupKey}
            ref={listRef}
            data={confessions}
            horizontal
            pagingEnabled
            snapToInterval={postSize}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            getItemLayout={(_, i) => ({ length: postSize, offset: postSize * i, index: i })}
            renderItem={({ item }) => (
              <View style={{ width: postSize, height: postSize }}>
                <RenderedConfession confessionObj={item} />
              </View>
            )}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onScrollToIndexFailed={onScrollToIndexFailed}
            extraData={`${groupKey}:${currentIndex}`}
            style={{ width: postSize, height: postSize }}
          />
        </View>
      </GestureDetector>

      {confessions.length > 1 && (
        <View key={`dots:${groupKey}`} style={styles.dotContainer}>
          {confessions.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
          ))}
        </View>
      )}

      <PostUIBar mode="confessions" ci={currentIndex} confessions={confessions} />
    </View>
  );
}

const styles = StyleSheet.create({
  dotContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  dot: {
    marginLeft: 2,
    marginRight: 2,
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#A77F2E',
  },
  activeDot: { backgroundColor: '#F5D054' },
});



// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
// import RenderedConfession from './RenderedConfession';
// import PostUIBar from '@/app/HomeComponents/PostUIBar';

// // confession is group of confession of same postID
// export default function ConfessionsPost({ confessions = [] }) {
//   const postSize = Dimensions.get('window').width;
//   const listRef = useRef(null);

//   // derive a stable group key from the first item (for resets)
//   const first = confessions[0] || {};
//   const groupResidence = first.residence ?? first.Residence ?? first.res ?? '';
//   const groupPostId    = String(
//     first.postId ?? first.postID ?? first.post_id ?? first.id ?? ''
//   );
//   const groupKey       = `${groupResidence}:${groupPostId}`;

//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Reset index & scroll whenever group changes
//   useEffect(() => {
//     setCurrentIndex(0);
//     const t = setTimeout(() => {
//       listRef.current?.scrollToIndex?.({ index: 0, animated: false });
//     }, 0);
//     return () => clearTimeout(t);
//   }, [groupKey]);

//   // Keep index in range if length changes within same group
//   useEffect(() => {
//     if (!confessions.length) { setCurrentIndex(0); return; }
//     if (currentIndex > confessions.length - 1) setCurrentIndex(confessions.length - 1);
//   }, [confessions.length]);

//   // Single source of truth: index from scroll offset
//   const onScroll = useCallback((e) => {
//     const x = e.nativeEvent.contentOffset.x;
//     const idx = Math.max(0, Math.min(confessions.length - 1, Math.floor((x + postSize / 2) / postSize)));
//     if (idx !== currentIndex) setCurrentIndex(idx);
//   }, [confessions.length, postSize, currentIndex]);

//   const onScrollToIndexFailed = (info) => {
//     setTimeout(() => {
//       listRef.current?.scrollToIndex?.({ index: info.index, animated: false });
//     }, 0);
//   };

//   const current = confessions[currentIndex] || {};

//   return (
//     <View key={groupKey}>
//       <FlatList
//         key={groupKey}
//         ref={listRef}
//         data={confessions}
//         horizontal
//         pagingEnabled
//         snapToInterval={postSize}
//         snapToAlignment="start"
//         decelerationRate="fast"
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(_, i) => String(i)}
//         getItemLayout={(_, i) => ({ length: postSize, offset: postSize * i, index: i })}
//         renderItem={({ item }) => (
//           <View style={{ width: postSize, height: postSize }}>
//             <RenderedConfession confessionObj={item} />
//           </View>
//         )}
//         onScroll={onScroll}
//         scrollEventThrottle={16}
//         onScrollToIndexFailed={onScrollToIndexFailed}
//         extraData={`${groupKey}:${currentIndex}`}
//         style={{ width: postSize, height: postSize }}
//       />

//       {/* dots */}
//       {confessions.length > 1 && (
//         <View key={`dots:${groupKey}`} style={styles.dotContainer}>
//           {confessions.map((_, i) => (
//             <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
//           ))}
//         </View>
//       )}

//       {/* UIBar for THIS group + THIS confession index */}
//       <PostUIBar
//         mode="confessions"
//         ci={currentIndex}
//         confessions={confessions}    // ✅ just pass the object
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   dotContainer: {
//     paddingTop: 5,
//     paddingBottom: 5,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     flex: 1,
//   },
//   dot: {
//     marginLeft: 2,
//     marginRight: 2,
//     width: 6,
//     height: 6,
//     borderRadius: 4,
//     backgroundColor: '#A77F2E',
//   },
//   activeDot: { backgroundColor: '#F5D054' },
// });
