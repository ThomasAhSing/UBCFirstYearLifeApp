import { FlatList, Dimensions, View, StyleSheet } from 'react-native';
import { useRef } from 'react';
import ConfessionsPost from './ConfessionsPost';

export default function AllConfessionsScroller({
  RES_CON_DATA = [],
  initialIndex = 0,
  style,
}) {
  const listRef = useRef(null);

  const POST_SIZE = Math.floor(Dimensions.get('window').width);
  const EXTRA_VERTICAL = 84;
  const ROW_HEIGHT = POST_SIZE + EXTRA_VERTICAL;

  return (
    <FlatList
      ref={listRef}
      style={[styles.container, style]}
      data={RES_CON_DATA}
      keyExtractor={(item, idx) => String(item?.[0]?.postID ?? idx)}
      initialScrollIndex={Math.max(0, Math.min(initialIndex, RES_CON_DATA.length - 1))}
      getItemLayout={(_data, index) => ({
        length: ROW_HEIGHT,
        offset: ROW_HEIGHT * index,
        index,
      })}
      onScrollToIndexFailed={(info) => {
        setTimeout(() => {
          listRef.current?.scrollToIndex?.({ index: info.index, animated: false });
        }, 0);
      }}
      renderItem={({ item }) => (
        <View style={{ height: ROW_HEIGHT }}>
          <ConfessionsPost confessions={item} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
