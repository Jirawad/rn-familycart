import {
  Kanit_400Regular,
  Kanit_700Bold,
  useFonts,
} from "@expo-google-fonts/kanit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { AppProvider, useApp } from "./appcontext";

// Native Splash Screen
SplashScreen.preventAutoHideAsync();

function LoadingUI() {
  return (
    <View style={styles.loadingContainer}>
      <Image
        source={require("../assets/images/online-shopping.png")}
        style={styles.loadingImage}
      />
      <ActivityIndicator
        size="large"
        color="#52B788"
        style={{ marginTop: 20 }}
      />
      <Text style={[styles.loadingText, { fontFamily: "Kanit-Bold" }]}>
        FamilyCart
      </Text>
    </View>
  );
}

function RootLayoutContent() {
  const { isDarkMode } = useApp();
  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="joinscreen" />
        <Stack.Screen name="grocerylistscreen" />
        <Stack.Screen name="additem" />
        <Stack.Screen name="itemdetail" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  // โหลดฟอนต์
  const [loaded] = useFonts({
    "Kanit-Regular": Kanit_400Regular,
    "Kanit-Bold": Kanit_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (loaded) {
          await SplashScreen.hideAsync();

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        if (loaded) {
          setAppIsReady(true);
        }
      }
    }
    prepare();
  }, [loaded]);

  if (!loaded || !appIsReady) {
    return <LoadingUI />;
  }

  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingImage: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  loadingText: {
    fontSize: 42,
    color: "#1B4332",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
  },
});
