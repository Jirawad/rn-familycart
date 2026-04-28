import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, DarkColors, Radius, Spacing, Typography } from "../lib/theme";
import { useApp } from "./appcontext";

export default function GraphScreen() {
  const router = useRouter();
  const { items, isDarkMode } = useApp();
  const theme = isDarkMode ? DarkColors : Colors;

  // คำนวณราคารวม
  const totalSpent = items
    .filter((i) => i.status === "purchased")
    .reduce((sum, item) => sum + (item.current_price || 0), 0);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Spending Dashboard
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.summaryLabel}>Total Spent This Month</Text>
          <Text style={styles.summaryValue}>฿{totalSpent.toFixed(2)}</Text>
        </View>

        <Text
          style={{ color: theme.textMuted, textAlign: "center", marginTop: 40 }}
        >
          Graph and Analytics coming soon... 📈
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.base,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: 18 },
  content: { padding: Spacing.base },
  summaryCard: { padding: 30, borderRadius: Radius.xl, alignItems: "center" },
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  summaryValue: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 10,
  },
});
