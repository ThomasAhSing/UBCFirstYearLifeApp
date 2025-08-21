// app/HomeComponents/ConfessionsPost.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dimensions, FlatList, StyleSheet, View, Text } from 'react-native';
import RenderedConfession from './RenderedConfession';
import PostUIBar from '@/app/HomeComponents/PostUIBar';
import { toggleLikedByKey } from '@/lib/likes';

export default function ConfessionsPost({
  confessions = [],
  blockedAuthors = [],         // global list from parent (persisted in AsyncStorage)
  onAuthorBlocked = () => {},  // parent updater: adds to global list + persists
}) {
  const postSize = Dimensions.get('window').width;
  const listRef = useRef(null);

  const first = confessions[0] || {};
  const groupResidence = first.residence ?? first.Residence ?? first.res ?? '';
  const groupPostId = String(first.postId ?? first.postID ?? first.post_id ?? first.id ?? '');
  const groupKey = `${groupResidence}:${groupPostId}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hidden, setHidden] = useState(false);  // “Hide post” covers whole group
  const [blockedLocal, setBlockedLocal] = useState([]); // session-only for instant UI in this group

  // If parent’s global list changes, re-render uses latest `blockedAuthors`
  useEffect(() => {}, [blockedAuthors]);

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

  const getAuthorId = useCallback((c) => {
    return String(c?.submittedFrom ?? c?.authorHandle ?? c?.uid ?? '');
  }, []);

  const isBlockedAuthor = useCallback((c) => {
    const id = getAuthorId(c);
    if (!id) return false;
    return blockedLocal.includes(id) || blockedAuthors.includes(id);
  }, [blockedLocal, blockedAuthors, getAuthorId]);

  const findNextUnblockedIndex = useCallback((startIdx) => {
    if (!Array.isArray(confessions) || confessions.length === 0) return -1;
    for (let i = startIdx; i < confessions.length; i++) {
      if (!isBlockedAuthor(confessions[i])) return i;
    }
    // Also search left if needed (e.g., you blocked the last one)
    for (let i = startIdx - 1; i >= 0; i--) {
      if (!isBlockedAuthor(confessions[i])) return i;
    }
    return -1;
  }, [confessions, isBlockedAuthor]);

  const onDoubleTap = useCallback(async () => {
    if (!groupResidence || !groupPostId) return;
    await toggleLikedByKey(`conf:${groupResidence}:${groupPostId}`);
  }, [groupResidence, groupPostId]);

  // If user hid the entire post, show a cover
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
                <Text style={{ color: '#cfe3ff', paddingBottom: 5 }}>
                  Confession hidden from blocked author.
                </Text>
                <Text style={{ color: '#cfe3ff' }}>
                  Swipe to see other confessions.
                </Text>
              </View>
            );
          }
          return (
            <View style={{ width: postSize, height: postSize }}>
              <RenderedConfession confessionObj={item} />
            </View>
          );
        }}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const idx = Math.max(0, Math.min(confessions.length - 1, Math.floor((x + postSize / 2) / postSize)));
          if (idx !== currentIndex) setCurrentIndex(idx);
        }}
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
        onHide={() => setHidden(true)}                  // hide whole group
        onBlockAuthor={(authorId) => {
          if (!authorId) return;
          // 1) session-only for this group (instant slide cover)
          setBlockedLocal(prev => (prev.includes(authorId) ? prev : [...prev, authorId]));
          // 2) global (all groups) — triggers immediate hide elsewhere
          onAuthorBlocked(authorId);

          // 3) if current slide now blocked, jump to next unblocked or cover post
          const curr = confessions[currentIndex];
          const currId = getAuthorId(curr);
          if (currId && (currId === authorId)) {
            const next = findNextUnblockedIndex(currentIndex + 1);
            if (next >= 0) {
              setCurrentIndex(next);
              requestAnimationFrame(() => {
                listRef.current?.scrollToIndex?.({ index: next, animated: true });
              });
            } else {
              setHidden(true);
            }
          }
        }}
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
  hiddenCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f2941',
    borderRadius: 12,
    marginBottom: 8,
  },
  hiddenText: { color: '#cfe3ff' },
});
