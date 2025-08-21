// app/uiBars/PostUIBar.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Platform, ActionSheetIOS, Alert } from 'react-native';
import LikeButton from '@/app/uiButtons/LikeButton';
import ShareButton from '@/app/uiButtons/ShareButton';
import BurgerButton from '@/app/uiButtons/BurgerButton';
import ReportPrompt from '@/app/components/ReportPrompt';
// import { api } from '@/context/DataContext';

/**
 * Props:
 *  mode="posts"
 *    - post: { shortcode, likes, caption, confessions? }
 *
 *  mode="confessions"
 *    - confessions: Array<Confession>  // all share residence + postID
 *    - ci?: number                     // index to focus (defaults to 0)
 *    - confessionIndex?: number        // index of confession to move to front
 */

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

  const getReportIds = useCallback(() => {
    if (mode === 'posts') {
      const post = props.post || {};
      const postId = String(post.shortcode ?? post.id ?? post._id ?? '');
      return { postId, confessionId: '' };
    }
    const c0 = (reorderedConfessions && reorderedConfessions[0]) || {};
    const postId = String(c0.postID ?? c0.postId ?? c0.post_id ?? '');
    const confessionId = String(c0.confessionId ?? c0._id ?? c0.id ?? '');
    return { postId, confessionId };
  }, [mode, props.post, reorderedConfessions]);

  const [showPrompt, setShowPrompt] = useState(false);

  const openReportPrompt = useCallback(() => setShowPrompt(true), []);
  const closeReportPrompt = useCallback(() => setShowPrompt(false), []);

  const handleReportSubmit = useCallback(async (reasonText) => {
    const { postId, confessionId } = getReportIds();
    try {
      // await api.post('/api/reports', {
      //   postId,
      //   confessionId,
      //   reason: reasonText,
      // });
      console.log(postId,confessionId)
    } catch (e) {
      // console.log('Report failed', e);
    } finally {
      Alert.alert(
        'Thanks for reporting',
        'We will address this issue within 24 hours.'
      );
    }
  }, [getReportIds]);

  const openMenu = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'hide post', 'block user', 'Report'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          userInterfaceStyle: 'dark',
        },
        (i) => { if (i === 3) openReportPrompt(); }
      );
    } else {
      Alert.alert('Options', '', [
        { text: 'Report', style: 'destructive', onPress: openReportPrompt },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [openReportPrompt]);

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
        (() => {
          return (
            <>
              <LikeButton mode="confessions" confession={props.confessions?.[0]} />
              <View style={{ flexDirection: 'row' }}>
                <ShareButton
                  mode="confessions"
                  confessions={reorderedConfessions}
                  ci={Number.isFinite(props.ci) ? props.ci : 0}
                  style={styles.btn}
                />
                <BurgerButton style={{ paddingRight: 15 }} onPress={openMenu} />
              </View>
            </>
          );
        })()
      )}

      {/* Report text prompt */}
      <ReportPrompt
        visible={showPrompt}
        onCancel={closeReportPrompt}
        onSubmit={(payload) => { closeReportPrompt(); handleReportSubmit(payload); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: { paddingLeft: 15, paddingRight: 15 },
});
