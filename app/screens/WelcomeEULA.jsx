import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image, Linking, ScrollView } from "react-native";
import { Colors } from '@/constants/Colors'

export default function WelcomeEULA({ visible, onAgree, onExit }) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* App Icon */}
          <Image
            source={{ uri: "https://firebasestorage.googleapis.com/v0/b/ubcfirstyearlifeapp.firebasestorage.app/o/ubcfyla_app_icon.png?alt=media&token=32f2af08-3064-4315-8a5c-e1d9afa88355" }}
            style={styles.icon}
          />

          <Text style={styles.title}>Welcome to First Year Life</Text>

          {/* Scrollable content: Purpose + EULA */}
          <View style={styles.scrollWrap}>
            <ScrollView
              // style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator
            >
              {/* Purpose (short + skimmable) */}
              <Text style={styles.sectionHeader}>What this app is</Text>
              <Text style={styles.purpose}>
                See campus updates on the Home Tab
              </Text>
              <Text style={styles.purpose}>
                View anonymous confessions from students
              </Text>
              <Text style={styles.purpose}>
                Submit your own anonymous confession
              </Text>
              <Text style={styles.purpose}>
                View upcoming campus events in the Events Tab
              </Text>
              <Text style={styles.purpose}>
                Enter the merch giveaway in the Giveaway Tab and increase your chances by sharing with friends
              </Text>



              {/* EULA / Guidelines */}
              <Text style={styles.sectionHeader}>Community guidelines & Terms</Text>
              <Text style={styles.text}>
                By continuing, you agree to our community guidelines and Terms of Use. We do not tolerate
                objectionable or abusive content (e.g., hate speech, harassment, sexually explicit content,
                or serious violent threats). Reports are reviewed within 24 hours and offending content is removed.
              </Text>

              {/* Links */}
              <Pressable onPress={() => Linking.openURL("https://ubcfirstyearlifeapp.onrender.com/terms")}>
                <Text style={styles.link}>Read full Terms & Privacy</Text>
              </Pressable>

              <Pressable onPress={() => Linking.openURL("https://ubcfirstyearlifeapp.onrender.com/support")}>
                <Text style={styles.link}>Contact Support</Text>
              </Pressable>
            </ScrollView>

          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {onExit ? (
              <Pressable style={[styles.btn, styles.ghost]} onPress={onExit}>
                <Text style={styles.btnGhostText}>Exit</Text>
              </Pressable>
            ) : null}
            <Pressable style={[styles.btn, styles.solid]} onPress={onAgree}>
              <Text style={styles.btnText}>I Agree</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const CARD_BG = "white";
const ACCENT = "#173E63";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "92%",
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    // keep center for icon/title, but the scroll area will stretch itself
    alignItems: "center",
  },
  icon: { width: 84, height: 84, borderRadius: 18, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" },

  scrollWrap: {
    alignSelf: "stretch",   // ✅ ensure full width
    maxHeight: 280,         // ✅ cap height
    minHeight: 40,          // ✅ tiny floor so it won't collapse
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  fade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
  },

  sectionHeader: { fontSize: 14, fontWeight: "800", color: "#111", marginTop: 6, marginBottom: 6 },
  purpose: { fontSize: 14, lineHeight: 20, color: "#222", marginBottom: 10 },
  text: { fontSize: 14, lineHeight: 20, color: "#333" },
  link: { color: "#1B73E8", marginTop: 12, fontWeight: "600" },

  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  solid: { backgroundColor: ACCENT, borderColor: ACCENT },
  ghost: { backgroundColor: "transparent" },
  btnText: { color: "white", fontWeight: "700" },
  btnGhostText: { color: ACCENT, fontWeight: "700" },
});
