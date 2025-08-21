import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dimensions, FlatList, StyleSheet, View, Text } from 'react-native';
import { toggleLikedByKey } from '@/lib/likes';
import RenderedConfession from './RenderedConfession';
import PostUIBar from '@/app/HomeComponents/PostUIBar';
import { loadBlockedConfAuthors } from '@/app/utils/moderationStore';

export default function ConfessionsPost({ confessions = [] }) {
  const postSize = Dimensions.get('window').width;
  const listRef = useRef(null);

  const first = confessions[0] || {};
  const groupResidence = first.residence ?? first.Residence ?? first.res ?? '';
  const groupPostId    = String(first.postId ?? first.postID ?? first.post_id ?? first.id ?? '');
  const groupKey       = `${groupResidence}:${groupPostId}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hidden, setHidden] = useState(false); // “Hide post” covers whole group
  const [blockedGlobal, setBlockedGlobal] = useState([]);  // from AsyncStorage
  const [blockedLocal, setBlockedLocal] = useState([]);    // session-only for instant UI

  // Load persisted blocked authors
  useEffect(() => {
    (async () => {
      const list = await loadBlockedConfAuthors();
      setBlockedGlobal(list || []);
    })();
  }, []);

  // Reset when group changes; jump to first slide
  useEffect(() => {
    setCurrentIndex(0);
    setHidden(false);
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex?.({ index: 0, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, [groupKey]);

  // Clamp currentIndex if data length changes
  useEffect(() => {
    if (!confessions.length) { setCurrentIndex(0); return; }
    if (currentIndex > confessions.length - 1) {
      setCurrentIndex(confessions.length - 1);
    }
  }, [confessions.length, currentIndex]);

  const onScroll = useCallback((e) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.max(0, Math.min(confessions.length - 1, Math.floor((x + postSize / 2) / postSize)));
    if (idx !== currentIndex) setCurrentIndex(idx);
  }, [confessions.length, postSize, currentIndex]);

  const onDoubleTap = useCallback(async () => {
    if (!groupResidence || !groupPostId) return;
    await toggleLikedByKey(`conf:${groupResidence}:${groupPostId}`);
  }, [groupResidence, groupPostId]);

  const isBlockedAuthor = useCallback((c) => {
    const id = String(c?.submittedFrom ?? c?.authorHandle ?? c?.uid ?? '');
    if (!id) return false;
    return blockedLocal.includes(id) || blockedGlobal.includes(id);
  }, [blockedLocal, blockedGlobal]);

  // Show cover if whole post hidden
  if (hidden) {
    return (
      <View key={`hidden:${groupKey}`} style={[styles.hiddenCard, { width: postSize, minHeight: postSize }]}>
        <Text style={styles.hiddenText}>This post was hidden.</Text>
      </View>
    );
  }

  return (
    <View key={groupKey}>
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
        renderItem={({ item }) => {
          const blocked = isBlockedAuthor(item);
          if (blocked) {
            return (
              <View
                style={{
                  width: postSize,
                  height: postSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#0f2941',
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#cfe3ff' }}>Confession hidden from blocked author.</Text>
              </View>
            );
          }
          return (
            <View style={{ width: postSize, height: postSize }}>
              <RenderedConfession confessionObj={item} />
            </View>
          );
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ width: postSize, height: postSize }}
      />

      {confessions.length > 1 && (
        <View key={`dots:${groupKey}`} style={styles.dotContainer}>
          {confessions.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
          ))}
        </View>
      )}

      <PostUIBar
        mode="confessions"
        ci={currentIndex}
        confessions={confessions}
        onHide={() => setHidden(true)} // “Hide post” should still cover whole group
        // Do NOT call onBlocked to hide the whole post; we only hide the current slide:
        onBlockAuthor={(authorId) => {
          if (!authorId) return;
          setBlockedLocal(prev => (prev.includes(authorId) ? prev : [...prev, authorId]));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dotContainer: {
    paddingTop: 5, paddingBottom: 5,
    flexDirection: 'row', justifyContent: 'center', flex: 1,
  },
  dot: { marginLeft: 2, marginRight: 2, width: 6, height: 6, borderRadius: 4, backgroundColor: '#A77F2E' },
  activeDot: { backgroundColor: '#F5D054' },
  hiddenCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f2941',
    borderRadius: 12,
    marginBottom: 8,
  },
  hiddenText: { color: '#cfe3ff' },
});
