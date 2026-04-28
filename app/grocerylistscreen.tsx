import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { groceryService } from "../lib/supabase";
import { Colors, DarkColors, Radius, Spacing, Typography } from "../lib/theme";
import { GroceryItem } from "../src";
import { useApp } from "./appcontext";
import GroceryItemCard from "./groceryitemcard";

type FilterStatus = "all" | "pending" | "purchased";

export default function GroceryListScreen() {
  const router = useRouter();
  const appData = useApp();

  const {
    items = [],
    loading = false,
    refreshItems,
    memberName = "User",
    familyGroup, // ดึงข้อมูลกลุ่มมาแสดงรหัส
    setFamilyGroup,
    setMemberName,
    isDarkMode = false,
    toggleDarkMode,
  } = appData || {};

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterFrequency, setFilterFrequency] = useState<string>("all");

  const theme = isDarkMode && DarkColors ? DarkColors : Colors;

  useEffect(() => {
    if (refreshItems) refreshItems();
  }, []);

  const handleToggleStatus = async (item: GroceryItem) => {
    if (!item) return;
    try {
      await (groceryService as any).toggleStatus(
        item.id,
        item.status,
        memberName,
      );
      if (refreshItems) refreshItems();
    } catch (error) {
      console.error("Toggle Error:", error);
      Alert.alert("Error", "Could not update status");
    }
  };

  const handleDelete = (item: GroceryItem) => {
    Alert.alert("Delete Item", `Remove "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await (groceryService as any).deleteItem(item.id);
            if (refreshItems) refreshItems();
          } catch (error) {
            console.error("Delete Error:", error);
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          if (setFamilyGroup) await setFamilyGroup(null);
          if (setMemberName) await setMemberName("");
          router.replace("/joinscreen" as any);
        },
      },
    ]);
  };

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => {
      if (!item) return false;
      const matchesSearch = (item.name?.toLowerCase() || "").includes(
        search.toLowerCase(),
      );
      const matchesStatus =
        filterStatus === "all" || item.status === filterStatus;
      const itemFreq = item.frequency?.toLowerCase() || "";
      const selectedFreq = filterFrequency.toLowerCase();
      const matchesFreq = selectedFreq === "all" || itemFreq === selectedFreq;
      return matchesSearch && matchesStatus && matchesFreq;
    });
  }, [items, search, filterStatus, filterFrequency]);

  const pendingCount = items.filter((i) => i?.status === "pending").length;
  const purchasedCount = items.filter((i) => i?.status === "purchased").length;

  const renderHeader = () => (
    <View>
      <View style={styles.statsBar}>
        <TouchableOpacity
          style={[
            styles.statChip,
            { backgroundColor: theme.surface, borderColor: theme.border },
            filterStatus === "all" && {
              borderColor: theme.primary,
              backgroundColor: theme.primaryPale,
            },
          ]}
          onPress={() => setFilterStatus("all")}
        >
          <Text
            style={[
              styles.statNum,
              { color: theme.textSecondary },
              filterStatus === "all" && { color: theme.primary },
            ]}
          >
            {items.length}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: theme.textMuted },
              filterStatus === "all" && { color: theme.primary },
            ]}
          >
            Total
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statChip,
            { backgroundColor: theme.surface, borderColor: theme.border },
            filterStatus === "pending" && {
              borderColor: theme.warning,
              backgroundColor: isDarkMode ? "#2A1D15" : "#FFF8F3",
            },
          ]}
          onPress={() => setFilterStatus("pending")}
        >
          <Text
            style={[
              styles.statNum,
              { color: theme.textSecondary },
              filterStatus === "pending" && { color: theme.warning },
            ]}
          >
            {pendingCount}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: theme.textMuted },
              filterStatus === "pending" && { color: theme.warning },
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statChip,
            { backgroundColor: theme.surface, borderColor: theme.border },
            filterStatus === "purchased" && {
              borderColor: theme.success,
              backgroundColor: isDarkMode ? "#152A1E" : "#F0FBF5",
            },
          ]}
          onPress={() => setFilterStatus("purchased")}
        >
          <Text
            style={[
              styles.statNum,
              { color: theme.textSecondary },
              filterStatus === "purchased" && { color: theme.success },
            ]}
          >
            {purchasedCount}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: theme.textMuted },
              filterStatus === "purchased" && { color: theme.success },
            ]}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search items..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.freqContainer}
        contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
      >
        {["all", "One-time", "Weekly", "Monthly"].map((freq) => (
          <TouchableOpacity
            key={freq}
            style={[
              styles.freqTab,
              { backgroundColor: theme.surface, borderColor: theme.border },
              filterFrequency === freq && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setFilterFrequency(freq)}
          >
            <Text
              style={[
                styles.freqText,
                { color: theme.textSecondary },
                filterFrequency === freq && { color: "white" },
              ]}
            >
              {freq === "all" ? "All" : freq}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.push("/familymembers" as any)}
          >
            <Text style={[styles.greeting, { color: theme.text }]}>
              Hello, {memberName}!
            </Text>
            <View style={styles.familyTag}>
              <Ionicons name="people" size={12} color={theme.primary} />
              <Text style={[styles.familyCode, { color: theme.primary }]}>
                Group: {familyGroup?.access_code}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.headerActions}>
          {/* ปุ่มไปหน้าสรุปค่าใช้จ่าย */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: isDarkMode ? "#1A2E35" : "#F0F9FF" },
            ]}
            onPress={() => router.push("/graphscreen" as any)}
          >
            <Ionicons name="bar-chart" size={20} color="#0077B6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: isDarkMode ? theme.primaryPale : "#F0F2F0" },
            ]}
            onPress={toggleDarkMode}
          >
            <Ionicons
              name={isDarkMode ? "sunny" : "moon"}
              size={20}
              color={isDarkMode ? theme.warning : theme.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push("/additem" as any)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) =>
          item?.id?.toString() || Math.random().toString()
        }
        renderItem={({ item }) => (
          <GroceryItemCard
            item={item}
            isDarkMode={isDarkMode}
            onToggle={() => handleToggleStatus(item)}
            onDelete={() => handleDelete(item)}
            onEdit={() => router.push(`/itemdetail?id=${item.id}` as any)}
            onPress={() => router.push(`/itemdetail?id=${item.id}` as any)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshItems}
            tintColor={theme.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  greeting: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.xl,
  },
  familyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  familyCode: { fontFamily: Typography.fontFamily.medium, fontSize: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  list: { padding: Spacing.base, paddingTop: Spacing.sm },
  statsBar: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  statChip: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderWidth: 1.5,
  },
  statNum: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.xl,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fontFamily.regular,
  },
  freqContainer: { marginBottom: Spacing.sm },
  freqTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  freqText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.xs,
  },
});
