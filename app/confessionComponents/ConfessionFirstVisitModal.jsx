import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import PlusIcon from '@/assets/icons/PlusIcon'
import { Colors } from '@/constants/Colors'


export default function ConfessionFirstVisitModal({
  visible,
  onClose,
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Image
            source={require('@/assets/images/ubcfyla_app_icon.png')}
            style={styles.icon}
            resizeMode="cover"
          />
          <Text style={styles.title}>Confessions</Text>

          <Text style={styles.paragraph}>
            Dump your intrusive thoughts or confess something you don't have the balls to do in person.
          </Text>
          <View style={{flexDirection: "row", marginTop: 10}}>
                <Text style={styles.paragraph}>
                  To submit your own confession, click the
                </Text>
                <View style={styles.addButton} >
                  <PlusIcon size={20} color="white" />
                </View>
              </View>



          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.solid]} onPress={onClose} accessibilityRole="button">
              <Text style={styles.btnGhostText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const CARD = '#0C2A42';
const BORDER = '#173E63';
const ACCENT = '#3B82F6';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '92%',
    maxWidth: 520,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
  },
  icon: { width: 64, height: 64, borderRadius: 14, alignSelf: 'center', marginBottom: 10 },
  title: { color: 'white', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  paragraph: { color: 'rgba(255,255,255,0.92)', lineHeight: 20, fontSize: 14 },
  bold: { color: 'white', fontWeight: '800' },
  rulesBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  rulesTitle: { color: 'white', fontWeight: '700', marginBottom: 6 },
  rulesLine: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  solid: { backgroundColor: ACCENT, borderColor: ACCENT },
  ghost: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.25)' },
  btnText: { color: 'white', fontWeight: '800' },
  btnGhostText: { color: 'white', fontWeight: '700' },
  addButton: {
    backgroundColor: Colors.goldAccent, borderRadius: 5, alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, marginLeft: 5
  },
});
