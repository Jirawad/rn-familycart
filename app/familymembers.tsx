import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import {
    Colors,
    DarkColors,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../lib/theme";
import { useApp } from "./appcontext";

export default function FamilyMembersScreen() {
  const router = useRouter();
  const { familyGroup, memberName, isDarkMode } = useApp();
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const theme = isDarkMode ? DarkColors : Colors;

  useEffect(() => {
    async function fetchMembers() {
      if (!familyGroup) return;
      try {
        // ดึงรายชื่อสมาชิกโดยอ
        const { data, error } = await supabase
          .from("family_members")
          .select("name")
          .eq("family_group_id", (familyGroup as any).id);

        if (data) {
          setMembers(data as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [familyGroup]);

  const onShareCode = async () => {
    try {
      const codeToShare = (familyGroup as any)?.access_code || "N/A";
      await Share.share({
        message: `Join my family on FamilyCart! Use this Access Code: ${codeToShare}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderMember = ({ item }: { item: { name: string } }) => (
    <View
      style={[
        styles.memberCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: theme.primaryPale }]}>
        <Text style={[styles.avatarText, { color: theme.primary }]}>
          {item.name ? item.name.charAt(0).toUpperCase() : "?"}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.memberName, { color: theme.text }]}>
          {item.name} {item.name === memberName && "(You)"}
        </Text>
        <Text style={[styles.memberRole, { color: theme.textSecondary }]}>
          Member
        </Text>
      </View>
      {item.name === memberName && (
        <View style={[styles.badge, { backgroundColor: theme.success + "20" }]}>
          <Text style={[styles.badgeText, { color: theme.success }]}>
            Online
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Family Members
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Family Info Card*/}
        <View style={[styles.groupCard, { backgroundColor: theme.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.groupLabel}>Family Group</Text>
            <Text style={styles.groupName} numberOfLines={1}>
              {(familyGroup as any)?.name || "My Family"}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={onShareCode}>
            <Text style={styles.codeLabel}>Access Code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>
                {(familyGroup as any)?.access_code || "---"}
              </Text>
              <Ionicons name="share-outline" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          MEMBERS IN THIS GROUP
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderMember}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: theme.textMuted,
                  marginTop: 20,
                }}
              >
                Only you are here... invite others!
              </Text>
            }
          />
        )}
      </View>
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
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: 18 },
  backBtn: { padding: 5 },
  content: { flex: 1, padding: Spacing.base },
  groupCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  groupLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  groupName: { color: "white", fontSize: 22, fontWeight: "bold" },
  shareBtn: { alignItems: "flex-end" },
  codeLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, marginBottom: 4 },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  codeText: { color: "white", fontWeight: "bold", fontSize: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: Spacing.md,
    letterSpacing: 1,
  },
  list: { gap: Spacing.sm },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "bold", fontSize: 18 },
  memberName: { fontWeight: "bold", fontSize: 16 },
  memberRole: { fontSize: 12 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 10, fontWeight: "bold" },
});
