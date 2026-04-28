import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export default function CustomSplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/online-shopping.png")}
        style={styles.image}
      />

      {/* ✅ เพิ่ม fontFamily: "Kanit-Bold" เข้าไปตรงนี้ด้วยครับ */}
      <Text
        style={[
          styles.text,
          { color: "#1B4332", opacity: 1, fontFamily: "Kanit-Bold" },
        ]}
      >
        FamilyCart
      </Text>

      <ActivityIndicator
        size="large"
        color="#52B788"
        style={{ marginTop: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 20,
  },
  text: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    // 💡 หรือจะระบุไว้ที่นี่เลยก็ได้ครับ
    // fontFamily: "Kanit-Bold",
  },
});
