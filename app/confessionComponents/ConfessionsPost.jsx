import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import RenderedConfession from './RenderedConfession';
import PostUIBar from '@/app/HomeComponents/PostUIBar';

// confession is group of confession of same postID
export default function ConfessionsSidecar({ confessions = [] }) {
  const postSize = Dimensions.get('window').width;
  const listRef = useRef(null);

  // derive group identifiers from the first confession (if any)
  const groupResidence = confessions[0]?.residence ?? '';
  const groupPostId    = confessions[0]?.postId ?? '';
  const groupKey       = `${groupResidence}:${groupPostId}`;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index & scroll whenever group changes
  useEffect(() => {
    setCurrentIndex(0);
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex?.({ index: 0, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, [groupKey]);

  // Keep index in range if length changes within same group
  useEffect(() => {
    if (!confessions.length) { setCurrentIndex(0); return; }
    if (currentIndex > confessions.length - 1) setCurrentIndex(confessions.length - 1);
  }, [confessions.length]);

  // Single source of truth: index from scroll offset
  const onScroll = useCallback((e) => {
    const x = e.nativeEvent.contentOffset.x;
    // add half page before flooring to snap to the nearest page mid-scroll
    const idx = Math.max(0, Math.min(confessions.length - 1, Math.floor((x + postSize / 2) / postSize)));
    if (idx !== currentIndex) setCurrentIndex(idx);
  }, [confessions.length, postSize, currentIndex]);

  const onScrollToIndexFailed = (info) => {
    setTimeout(() => {
      listRef.current?.scrollToIndex?.({ index: info.index, animated: false });
    }, 0);
  };

  const current = confessions[currentIndex] || {};
// console.log(current)
// console.log(current.confessionIndex)
// console.log(current.content)

  return (
    <View key={groupKey}>
      <FlatList
        key={groupKey} // fresh list per group (prevents stale index/dots)
        ref={listRef}
        data={confessions}
        horizontal
        pagingEnabled
        // deterministic snapping + stable index math
        snapToInterval={postSize}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: postSize, offset: postSize * i, index: i })}
        // Ensure each page is EXACTLY the screen width so idx math is correct
        renderItem={({ item }) => (
          <View style={{ width: postSize, height: postSize }}>
            <RenderedConfession confessionObj={item} />
          </View>
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollToIndexFailed={onScrollToIndexFailed}
        // extraData ensures a re-render when group/index changes
        extraData={`${groupKey}:${currentIndex}`}
        style={{ width: postSize, height: postSize }}
      />

      {/* dots */}
      {confessions.length > 1 && (
        <View key={`dots:${groupKey}`} style={styles.dotContainer}>
          {confessions.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
          ))}
        </View>
      )}
      {/* UIBar for THIS group + THIS confession index */}
      <PostUIBar
        mode="confessions"
        residence={groupResidence}
        postId={groupPostId}
        ci={currentIndex}
        content={current.content || ''}
        confession={current}
      />
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
