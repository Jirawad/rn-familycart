import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, DarkColors, Radius, Spacing, Typography } from "../lib/theme";
import { GroceryItem } from "../src";

interface GroceryItemCardProps {
  item: GroceryItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPress: () => void;
  isDarkMode?: boolean;
}

export default function GroceryItemCard({
  item,
  onToggle,
  onEdit,
  onDelete,
  onPress,
  isDarkMode = false,
}: GroceryItemCardProps) {
  if (!item) return null;

  const theme = isDarkMode && DarkColors ? DarkColors : Colors;
  const isPurchased = item?.status === "purchased";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface || "#FFFFFF",
          borderColor: theme.border || "#EEEEEE",
          opacity: isPurchased ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        {/* Checkbox Button */}
        <TouchableOpacity
          style={[
            styles.checkCircle,
            {
              borderColor: isPurchased
                ? theme.success || "#52B788"
                : theme.border || "#EEEEEE",
            },
            isPurchased && { backgroundColor: theme.success || "#52B788" },
          ]}
          onPress={onToggle}
        >
          {isPurchased && <Ionicons name="checkmark" size={16} color="white" />}
        </TouchableOpacity>

        {/* Text Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.name,
              { color: theme.text || "#000000" },
              isPurchased && styles.textStrikethrough,
            ]}
            numberOfLines={1}
          >
            {item?.name || "No Name"}
          </Text>
          <Text
            style={[
              styles.details,
              { color: theme.textSecondary || "#666666" },
            ]}
          >
            {item?.quantity || 0} {item?.unit || ""} • ฿
            {item?.current_price ? item.current_price.toFixed(2) : "0.00"}
          </Text>
        </View>

        {/* ✅ Actions Area: Trash Button + Chevron */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // กันไม่ให้เด้งไปหน้า Detail เมื่อกดลบ
              onDelete();
            }}
            style={styles.deleteBtn}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.danger || "#FF4D4D"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textMuted || "#999999"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.md,
  },
  textStrikethrough: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  details: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  actionBtn: {
    padding: Spacing.xs,
  },
});
