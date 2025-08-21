import { FlatList, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Post from '@/app/HomeComponents/Post';
import { DataContext } from '@/context/DataContext';
import { loadHiddenPostShortcodes, loadBlockedPostUsers } from '@/app/utils/moderationStore';

export default function PostFlatList() {
  const { postData } = useContext(DataContext); // RAW posts
  const [hiddenShortcodes, setHiddenShortcodes] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // called when any Post triggers "Block user" (immediate UI update)
  const onUserBlocked = useCallback((uname) => {
    if (!uname) return;
    setBlockedUsers(prev => (prev.includes(uname) ? prev : [...prev, String(uname)]));
  }, []);

  // load once
  useEffect(() => {
    (async () => {
      const [h, b] = await Promise.all([
        loadHiddenPostShortcodes(),
        loadBlockedPostUsers(),
      ]);
      setHiddenShortcodes(h);
      setBlockedUsers(b);
    })();
  }, []);

  // reload whenever screen refocuses (e.g., after you hide/block elsewhere)
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        const [h, b] = await Promise.all([
          loadHiddenPostShortcodes(),
          loadBlockedPostUsers(),
        ]);
        if (isActive) {
          setHiddenShortcodes(h);
          setBlockedUsers(b);
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <FlatList
      style={styles.container}
      data={postData || []} // render all; each row decides its own cover
      keyExtractor={item => String(item?.shortcode ?? Math.random())}
      renderItem={({ item }) => {
        const sc = String(item?.shortcode ?? '');
        const uname = String(item?.userFetchedFrom ?? '');
        let hiddenReason = null;
        if (sc && hiddenShortcodes.includes(sc)) hiddenReason = 'hidden';      // specific post hidden
        else if (uname && blockedUsers.includes(uname)) hiddenReason = 'blocked'; // account blocked

        return (
          <Post
            post={item}
            hiddenReason={hiddenReason}
            onUserBlocked={onUserBlocked}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
});
