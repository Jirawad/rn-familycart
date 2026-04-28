import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { groceryService } from "../lib/supabase";
import {
  Colors,
  DarkColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../lib/theme";
import { useApp } from "./appcontext";

export default function ItemDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const { items, refreshItems, memberName, isDarkMode } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    quantity: "",
    current_price: "",
    frequency: "One-time",
  });

  const theme = isDarkMode ? DarkColors : Colors;

  const item = useMemo(() => {
    if (!id) return null;
    return items.find((i) => i.id === id) || null;
  }, [items, id]);

  useEffect(() => {
    if (item) {
      setEditData({
        name: item.name,
        quantity: item.quantity.toString(),
        current_price: item.current_price?.toString() || "0",
        frequency: (item as any).frequency || "One-time",
      });
    }
  }, [isEditing, item]);

  if (!item) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.center}>
          <Text
            style={{
              fontFamily: Typography.fontFamily.regular,
              color: theme.text,
            }}
          >
            Item not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await (groceryService as any).updateItem(item.id, {
        name: editData.name,
        quantity: parseFloat(editData.quantity),
        current_price: parseFloat(editData.current_price),
        purchased_by: memberName,
      });

      if (error) {
        Alert.alert("Error", "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      await refreshItems();
      setIsEditing(false);
      Alert.alert("Success", "Updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Could not update item");
    } finally {
      setLoading(false);
    }
  };

  const frequencies = ["One-time", "Weekly", "Monthly"];

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEditing ? "Editing Item" : "Item Details"}
        </Text>

        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={[
            styles.editBtn,
            {
              backgroundColor: isEditing
                ? isDarkMode
                  ? "#3D2C1E"
                  : "#FFF3E0"
                : isDarkMode
                  ? theme.primaryPale
                  : "#E8F5E9",
            },
          ]}
        >
          <Ionicons
            name={isEditing ? "close" : "pencil"}
            size={20}
            color={isEditing ? theme.warning : theme.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface }]}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor:
                  item.status === "purchased"
                    ? isDarkMode
                      ? "#152A1E"
                      : "#F0FBF5"
                    : isDarkMode
                      ? "#2A1D15"
                      : "#FFF8F3",
              },
            ]}
          >
            <Text style={{ fontSize: 40 }}>
              {item.status === "purchased" ? "✅" : "🛒"}
            </Text>
          </View>

          {isEditing ? (
            <TextInput
              style={[
                styles.inputMain,
                { color: theme.text, borderColor: theme.primary },
              ]}
              value={editData.name}
              onChangeText={(t) => setEditData({ ...editData, name: t })}
            />
          ) : (
            <Text style={[styles.itemName, { color: theme.text }]}>
              {item.name}
            </Text>
          )}
        </View>

        {/* แสดง Frequency */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <Text
            style={[
              styles.infoLabel,
              { color: theme.textMuted, marginBottom: 10 },
            ]}
          >
            Frequency
          </Text>
          {isEditing ? (
            <View style={styles.freqRow}>
              {frequencies.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.freqBtn,
                    { borderColor: theme.border },
                    editData.frequency === f && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => setEditData({ ...editData, frequency: f })}
                >
                  <Text
                    style={[
                      styles.freqText,
                      { color: theme.textSecondary },
                      editData.frequency === f && { color: "white" },
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.badge}>
              <Ionicons name="repeat" size={16} color={theme.primary} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {(item as any).frequency || "One-time"}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Price (฿)
          </Text>
          {isEditing ? (
            <TextInput
              style={[
                styles.inputPrice,
                { color: theme.primary, borderColor: theme.primary },
              ]}
              value={editData.current_price}
              onChangeText={(t) =>
                setEditData({ ...editData, current_price: t })
              }
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.priceText, { color: theme.primary }]}>
              ฿{item.current_price?.toFixed(2) || "0.00"}
            </Text>
          )}
        </View>

        <View style={[styles.detailsGrid, { backgroundColor: theme.surface }]}>
          <View style={styles.detailItem}>
            <Ionicons name="layers-outline" size={20} color={theme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                Quantity
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.inputSmall,
                    { color: theme.text, borderColor: theme.primary },
                  ]}
                  value={editData.quantity}
                  onChangeText={(t) =>
                    setEditData({ ...editData, quantity: t })
                  }
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {item.quantity} {item.unit}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actionArea}>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.mainBtn,
                {
                  backgroundColor:
                    item.status === "pending" ? theme.success : theme.warning,
                },
              ]}
              onPress={() =>
                (groceryService as any)
                  .toggleStatus(item.id, item.status, memberName)
                  .then(refreshItems)
              }
            >
              <Ionicons
                name={item.status === "pending" ? "checkmark-circle" : "time"}
                size={22}
                color="white"
              />
              <Text style={styles.mainBtnText}>
                {item.status === "pending"
                  ? "Mark as Purchased"
                  : "Set to Pending"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.lg,
  },
  backBtn: { padding: 5 },
  editBtn: { padding: 8, borderRadius: Radius.md },
  scroll: { padding: Spacing.base },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    ...Shadows.md,
    marginBottom: Spacing.base,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  itemName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
    textAlign: "center",
  },
  inputMain: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    borderBottomWidth: 1,
    width: "100%",
    textAlign: "center",
    padding: 5,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  infoCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  infoLabel: { fontFamily: Typography.fontFamily.medium, fontSize: 14 },
  priceText: { fontFamily: Typography.fontFamily.bold, fontSize: 32 },
  inputPrice: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 32,
    borderBottomWidth: 1,
    width: "60%",
    textAlign: "center",
  },
  detailsGrid: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    ...Shadows.sm,
  },
  detailItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  detailLabel: { fontFamily: Typography.fontFamily.regular, fontSize: 12 },
  detailValue: { fontFamily: Typography.fontFamily.bold, fontSize: 14 },
  inputSmall: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    borderBottomWidth: 1,
    padding: 0,
  },
  freqRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  freqText: { fontFamily: Typography.fontFamily.medium, fontSize: 12 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  badgeText: { fontFamily: Typography.fontFamily.bold, fontSize: 14 },
  actionArea: { marginTop: Spacing.xl },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: Radius.md,
    ...Shadows.md,
  },
  saveBtnText: {
    fontFamily: Typography.fontFamily.bold,
    color: "white",
    fontSize: 16,
  },
  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: Radius.md,
    ...Shadows.md,
  },
  mainBtnText: {
    fontFamily: Typography.fontFamily.bold,
    color: "white",
    fontSize: 16,
  },
});
