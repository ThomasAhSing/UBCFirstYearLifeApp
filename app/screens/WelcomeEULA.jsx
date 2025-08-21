import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image, Linking } from "react-native";

export default function WelcomeEULA({ visible, onAgree, onExit }) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* App Icon */}
          <Image
            source={{
              uri:
                "https://firebasestorage.googleapis.com/v0/b/ubcfirstyearlifeapp.firebasestorage.app/o/ubcfyla_app_icon.png?alt=media&token=32f2af08-3064-4315-8a5c-e1d9afa88355",
            }}
            style={styles.icon}
          />

          <Text style={styles.title}>Welcome to First Year Life</Text>
          <Text style={styles.text}>
            By continuing, you agree to our community guidelines and Terms of Use. We do
            not tolerate objectionable or abusive content (e.g., hate speech, harassment,
            sexually explicit, or serious violent threats). Reports are reviewed within
            24 hours and offending content is removed.
          </Text>

          {/* Terms link */}
          <Pressable
            onPress={() =>
              Linking.openURL("https://ubcfirstyearlifeapp.onrender.com/terms")
            }
          >
            <Text style={styles.link}>Read full Terms & Privacy</Text>
          </Pressable>

          {/* Support link */}
          <Pressable
            onPress={() =>
              Linking.openURL("https://ubcfirstyearlifeapp.onrender.com/support")
            }
          >
            <Text style={styles.link}>Contact Support</Text>
          </Pressable>

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  card: {
    width: "92%", backgroundColor: "white", borderRadius: 20,
    padding: 20, alignItems: "center",
  },
  icon: { width: 84, height: 84, borderRadius: 18, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  text: { fontSize: 14, lineHeight: 20, color: "#333", textAlign: "center" },
  link: { color: "#1B73E8", marginTop: 12, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#ddd" },
  solid: { backgroundColor: "#173E63", borderColor: "#173E63" },
  ghost: { backgroundColor: "transparent" },
  btnText: { color: "white", fontWeight: "700" },
  btnGhostText: { color: "#173E63", fontWeight: "700" },
});
