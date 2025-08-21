import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Platform, ActionSheetIOS, Alert } from 'react-native';
import LikeButton from '@/app/uiButtons/LikeButton';
import ShareButton from '@/app/uiButtons/ShareButton';
import BurgerButton from '@/app/uiButtons/BurgerButton';
import ReportPrompt from '@/app/components/ReportPrompt';

import {
  hidePostShortcode,
  hideConfPostId,
  blockPostUser,
  blockConfAuthor,
} from '@/app/utils/moderationStore';

export default function PostUIBar(props) {
  const { mode } = props;

  const reorderedConfessions = useMemo(() => {
    if (mode !== 'confessions' || !Array.isArray(props.confessions)) return props.confessions;
    const idx = Number.isFinite(props.confessionIndex) ? props.confessionIndex : -1;
    if (idx < 0 || idx >= props.confessions.length) return props.confessions;
    const arr = [...props.confessions];
    const [target] = arr.splice(idx, 1);
    return [target, ...arr];
  }, [props.confessions, props.confessionIndex, mode]);

  const [showPrompt, setShowPrompt] = useState(false);
  const openReportPrompt = useCallback(() => setShowPrompt(true), []);
  const closeReportPrompt = useCallback(() => setShowPrompt(false), []);

  const handleReportSubmit = useCallback(async (reasonText) => {
    Alert.alert('Thanks for reporting', 'We will address this issue within 24 hours.');
  }, []);

  // Hide (post or confessions group)
  const handleHide = useCallback(async () => {
    if (mode === 'posts') {
      const sc = String(props.post?.shortcode ?? '');
      if (sc) await hidePostShortcode(sc);
      props.onHide?.();
      Alert.alert('Hidden', 'This post is hidden from your feed.');
      return;
    }
    // confessions → hide the WHOLE group by postID
    const c0 = props.confessions?.[0] || {};
    const confPostId = String(c0.postID ?? c0.postId ?? c0.post_id ?? '');
    if (confPostId) await hideConfPostId(confPostId);
    props.onHide?.();
    Alert.alert('Hidden', 'This post is hidden from your feed.');
  }, [mode, props]);

  // Block
  const handleBlock = useCallback(async () => {
    if (mode === 'posts') {
      const uname = String(props.post?.userFetchedFrom ?? '');
      if (uname) {
        await blockPostUser(uname);
        props.onBlocked?.(); // ok to cover just this card in posts
        Alert.alert('Post hidden from blocked user', 'You won’t see posts from this account.');
      }
      return;
    }

    // confessions: block ONLY the author of the CURRENT slide
    if (mode === 'confessions') {
      const ci = Number.isFinite(props.ci) ? props.ci : 0;
      const curr = Array.isArray(props.confessions) ? props.confessions[ci] : null;
      const authorId = String(curr?.submittedFrom ?? curr?.authorHandle ?? curr?.uid ?? '');
      if (authorId) {
        await blockConfAuthor(authorId);     // persist
        props.onBlockAuthor?.(authorId);     // update current carousel immediately
        Alert.alert('Blocked', 'You won’t see confessions from this author.');
      }
      return;
    }
  }, [mode, props]);

  const openMenu = useCallback(() => {
    const options = ['Cancel', 'Hide post', 'Block user', 'Report'];
    const cancel = 0, hide = 1, block = 2, report = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancel, destructiveButtonIndex: report, userInterfaceStyle: 'dark' },
        (i) => {
          if (i === hide)  handleHide();
          if (i === block) handleBlock();
          if (i === report) openReportPrompt();
        }
      );
    } else {
      Alert.alert('Options', '', [
        { text: 'Hide post', onPress: handleHide },
        { text: 'Block user', onPress: handleBlock },
        { text: 'Report', style: 'destructive', onPress: openReportPrompt },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [handleHide, handleBlock, openReportPrompt]);

  return (
    <View style={styles.container}>
      {mode === 'posts' ? (
        <>
          <LikeButton mode={mode} post={props.post} />
          <View style={{ flexDirection: 'row' }}>
            <ShareButton mode="posts" post={props.post} style={styles.btn} />
            <BurgerButton style={{ paddingRight: 15 }} onPress={openMenu} />
          </View>
        </>
      ) : (
        <>
          <LikeButton mode="confessions" confession={props.confessions?.[props.ci || 0]} />
          <View style={{ flexDirection: 'row' }}>
            <ShareButton
              mode="confessions"
              confessions={props.confessions}
              ci={Number.isFinite(props.ci) ? props.ci : 0}
              style={styles.btn}
            />
            <BurgerButton style={{ paddingRight: 15 }} onPress={openMenu} />
          </View>
        </>
      )}

      <ReportPrompt
        visible={showPrompt}
        onCancel={closeReportPrompt}
        onSubmit={(payload) => { closeReportPrompt(); handleReportSubmit(payload); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { paddingLeft: 15, paddingRight: 15 },
});
