import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { familyGroupService } from "../lib/supabase";
import {
  Colors,
  DarkColors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../lib/theme";
import { useApp } from "./appcontext";

type Mode = "join" | "create";

export default function JoinScreen() {
  const router = useRouter();
  const { setFamilyGroup, setMemberName, isDarkMode, toggleDarkMode } =
    useApp();
  const [mode, setMode] = useState<Mode>("join");
  const [memberName, setMemberNameLocal] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);

  // กำหนดธีมตามโหมด
  const theme = isDarkMode ? DarkColors : Colors;

  const handleJoin = async () => {
    if (!memberName.trim())
      return Alert.alert("Required", "Please enter your name.");
    if (!accessCode.trim())
      return Alert.alert("Required", "Please enter the access code.");

    setLoading(true);
    try {
      const { data, error } = await familyGroupService.joinByCode(accessCode);
      if (error || !data) {
        Alert.alert(
          "Not Found",
          "No family group found with that code. Check the code and try again.",
        );
        return;
      }
      await setMemberName(memberName.trim());
      await setFamilyGroup(data);
      router.replace("/grocerylistscreen" as any);
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!memberName.trim())
      return Alert.alert("Required", "Please enter your name.");
    if (!familyName.trim())
      return Alert.alert("Required", "Please enter your family name.");
    if (!accessCode.trim() || accessCode.length < 4) {
      return Alert.alert(
        "Required",
        "Access code must be at least 4 characters.",
      );
    }

    setLoading(true);
    try {
      const { data, error } = await familyGroupService.create(
        familyName.trim(),
        accessCode,
      );
      if (error) {
        if (error.code === "23505") {
          Alert.alert(
            "Code Taken",
            "That access code is already in use. Try a different one.",
          );
        } else {
          Alert.alert("Error", error.message);
        }
        return;
      }
      if (data) {
        await setMemberName(memberName.trim());
        await setFamilyGroup(data);
        router.replace("/grocerylistscreen" as any);
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* ปุ่มสลับ Dark Mode */}
      <TouchableOpacity
        style={[styles.themeToggle, { backgroundColor: theme.surface }]}
        onPress={toggleDarkMode}
      >
        <Ionicons
          name={isDarkMode ? "sunny" : "moon"}
          size={22}
          color={isDarkMode ? theme.warning : theme.primary}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View
              style={[styles.logoWrap, { backgroundColor: theme.primaryPale }]}
            >
              <Text style={styles.logoEmoji}>🛒</Text>
            </View>
            <Text style={[styles.appTitle, { color: theme.primaryDark }]}>
              FamilyCart
            </Text>
            <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
              Manage groceries together,{"\n"}effortlessly.
            </Text>
          </View>

          <View style={[styles.toggleWrap, { backgroundColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === "join" && [
                  styles.toggleBtnActive,
                  { backgroundColor: theme.surface },
                ],
              ]}
              onPress={() => setMode("join")}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: theme.textMuted },
                  mode === "join" && {
                    color: theme.primaryDark,
                    fontFamily: Typography.fontFamily.bold,
                  },
                ]}
              >
                Join Family
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === "create" && [
                  styles.toggleBtnActive,
                  { backgroundColor: theme.surface },
                ],
              ]}
              onPress={() => setMode("create")}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: theme.textMuted },
                  mode === "create" && {
                    color: theme.primaryDark,
                    fontFamily: Typography.fontFamily.bold,
                  },
                ]}
              >
                Create Family
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                Your Name
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={theme.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textMuted}
                  value={memberName}
                  onChangeText={setMemberNameLocal}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {mode === "create" && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Family Name
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                >
                  <Ionicons
                    name="home-outline"
                    size={18}
                    color={theme.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Family"
                    placeholderTextColor={theme.textMuted}
                    value={familyName}
                    onChangeText={setFamilyName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                {mode === "join" ? "Family Access Code" : "Create Access Code"}
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={18}
                  color={theme.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.codeInput,
                    { color: theme.text },
                  ]}
                  placeholder="CODE"
                  placeholderTextColor={theme.textMuted}
                  value={accessCode}
                  onChangeText={(t) => setAccessCode(t.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={12}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: theme.primary },
                loading && styles.submitBtnDisabled,
              ]}
              onPress={mode === "join" ? handleJoin : handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.textInverse} />
              ) : (
                <>
                  <Ionicons
                    name={
                      mode === "join" ? "enter-outline" : "add-circle-outline"
                    }
                    size={20}
                    color={theme.textInverse}
                  />
                  <Text
                    style={[styles.submitText, { color: theme.textInverse }]}
                  >
                    {mode === "join" ? "Join Family" : "Create Family"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeToggle: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.sm,
  },
  scroll: { flexGrow: 1, padding: Spacing.base },
  header: { alignItems: "center", paddingVertical: Spacing["2xl"] },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.base,
    ...Shadows.md,
  },
  logoEmoji: { fontSize: 40 },
  appTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes["3xl"],
    letterSpacing: -1,
  },
  appSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.sizes.base,
    marginTop: Spacing.xs,
    textAlign: "center",
    lineHeight: 22,
  },
  toggleWrap: {
    flexDirection: "row",
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: "center",
  },
  toggleBtnActive: { ...Shadows.sm },
  toggleText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.sizes.sm,
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
    marginBottom: Spacing.lg,
  },
  fieldGroup: { marginBottom: Spacing.base },
  label: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xs,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: Radius.md,
  },
  inputIcon: { paddingHorizontal: Spacing.md },
  input: {
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    fontSize: Typography.sizes.base,
  },
  codeInput: {
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 2,
  },
  submitBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    fontFamily: Typography.fontFamily.bold,
  },
});
