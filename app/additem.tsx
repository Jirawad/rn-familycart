import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

export default function AddItemScreen() {
  const router = useRouter();
  const { familyGroup, refreshItems, memberName, isDarkMode } = useApp();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [unitValue, setUnitValue] = useState("1");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [isSaving, setIsSaving] = useState(false);

  const theme = isDarkMode ? DarkColors : Colors;

  const adjustUnit = (amount: number) => {
    const current = parseInt(unitValue) || 0;
    const next = Math.max(1, current + amount);
    setUnitValue(next.toString());
  };

  const handleSave = async () => {
    if (!name.trim() || !familyGroup) return;
    setIsSaving(true);
    try {
      const { error } = await (groceryService as any).addItem({
        family_group_id: familyGroup.id,
        name: name.trim(),
        category,
        quantity: parseInt(unitValue) || 1,
        unit: "unit",
        current_price: parseFloat(price) || 0,
        frequency,
        status: "pending",
        purchased_by: memberName,
      });

      if (!error) {
        await refreshItems();
        router.back();
      }
    } finally {
      setIsSaving(false);
    }
  };

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
          <Ionicons name="close" size={26} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Add New Item
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Item Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Item Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder=""
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        {/* Estimated Price */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Estimated Price (฿)
          </Text>
          <View
            style={[
              styles.priceInputWrap,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text
              style={[styles.currencySymbol, { color: theme.textSecondary }]}
            >
              ฿
            </Text>
            <TextInput
              style={[styles.priceInput, { color: theme.primary }]}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* (เปลี่ยนเป็นตัวเลือกตัวเลข) */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Quantity
          </Text>
          <View style={styles.unitSelector}>
            <TouchableOpacity
              style={[styles.unitBtn, { backgroundColor: theme.border }]}
              onPress={() => adjustUnit(-1)}
            >
              <Ionicons name="remove" size={24} color={theme.text} />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.unitInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              keyboardType="number-pad"
              value={unitValue}
              onChangeText={(v) => setUnitValue(v.replace(/[^0-9]/g, ""))}
              textAlign="center"
            />

            <TouchableOpacity
              style={[styles.unitBtn, { backgroundColor: theme.primaryPale }]}
              onPress={() => adjustUnit(1)}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Frequency
          </Text>
          <View style={styles.chipRow}>
            {["once", "weekly", "monthly"].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  frequency === f && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setFrequency(f)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    frequency === f && {
                      color: "white",
                      fontFamily: Typography.fontFamily.bold,
                    },
                  ]}
                >
                  {f === "once"
                    ? "One-time"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: theme.primary },
            (!name || !unitValue) && { opacity: 0.5 },
          ]}
          onPress={handleSave}
          disabled={!name || !unitValue || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveBtnText}>Add to Shopping List</Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
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
    paddingHorizontal: Spacing.base,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.lg,
  },
  backBtn: { padding: 5 },
  content: { padding: Spacing.base },
  inputGroup: { marginBottom: Spacing.lg },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
    marginBottom: 8,
  },
  input: {
    fontFamily: Typography.fontFamily.regular,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
  },
  priceInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  currencySymbol: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 18,
    marginRight: 5,
  },
  priceInput: {
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
  },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  unitBtn: {
    width: 45,
    height: 45,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  unitInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: Radius.md,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fontFamily.bold,
  },
  chipRow: { flexDirection: "row", gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
  },
  saveBtn: {
    flexDirection: "row",
    padding: 18,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  saveBtnText: {
    fontFamily: Typography.fontFamily.bold,
    color: "white",
    fontSize: 16,
  },
});
