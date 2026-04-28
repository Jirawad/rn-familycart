// src/lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://cxwpdyitvhydjnkweeiy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vdOSTShi2wuOGz8A_iMBww_R6EQH_ub";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:
      Platform.OS === "web"
        ? typeof window !== "undefined"
          ? window.localStorage
          : undefined
        : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================================
// FAMILY GROUP OPERATIONS
// ============================================================

export const familyGroupService = {
  /**
   * เข้าร่วมกลุ่มและบันทึกชื่อลง family_members
   */
  async joinByCode(accessCode: string, memberName: string) {
    // 1. ตรวจสอบว่ากลุ่มมีจริงไหม
    const { data: group, error: groupError } = await supabase
      .from("family_groups")
      .select("*")
      .eq("access_code", accessCode.toUpperCase().trim())
      .single();

    if (groupError || !group) return { data: null, error: groupError };

    // บันทึกชื่อคนจอยลงตารางสมาชิก
    const { error: memberError } = await supabase
      .from("family_members")
      .insert([
        {
          family_group_id: group.id,
          name: memberName,
        },
      ]);

    return { data: group, error: memberError };
  },

  /**
   *สร้างกลุ่มและบันทึกชื่อผู้สร้างเป็นสมาชิกคนแรก
   */
  async create(name: string, accessCode: string, memberName: string) {
    // 1. สร้างกลุ่ม
    const { data: group, error: groupError } = await supabase
      .from("family_groups")
      .insert([{ name, access_code: accessCode.toUpperCase().trim() }])
      .select()
      .single();

    if (groupError || !group) return { data: null, error: groupError };

    // บันทึกชื่อผู้สร้างลงตารางสมาชิก
    const { error: memberError } = await supabase
      .from("family_members")
      .insert([
        {
          family_group_id: group.id,
          name: memberName,
        },
      ]);

    return { data: group, error: memberError };
  },
};

// ============================================================
// GROCERY ITEM OPERATIONS
// ============================================================

export const groceryService = {
  async getItems(familyGroupId: string) {
    const { data, error } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("family_group_id", familyGroupId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  /**
   * ดึงรายชื่อสมาชิกจากตาราง family_members โดยตรง
   */
  async getFamilyMembers(familyGroupId: string) {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("family_group_id", familyGroupId)
      .order("created_at", { ascending: true });

    return { data, error };
  },

  async addItem(item: {
    family_group_id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    frequency: string;
    current_price?: number;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from("grocery_items")
      .insert([item])
      .select()
      .single();

    return { data, error };
  },

  async updateItem(id: string, updates: any) {
    const { data, error } = await supabase
      .from("grocery_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  async toggleStatus(
    id: string,
    currentStatus: string,
    memberName: string,
    newPrice?: number,
  ) {
    const isPurchasing = currentStatus === "pending";
    const updates: Record<string, unknown> = {
      status: isPurchasing ? "purchased" : "pending",
      purchased_at: isPurchasing ? new Date().toISOString() : null,
      purchased_by: isPurchasing ? memberName : null,
    };

    if (isPurchasing && newPrice !== undefined) {
      const { data: currentItem } = await supabase
        .from("grocery_items")
        .select("current_price")
        .eq("id", id)
        .single();

      if (currentItem?.current_price) {
        updates.previous_price = currentItem.current_price;
      }
      updates.current_price = newPrice;
    }

    const { data, error } = await supabase
      .from("grocery_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("id", id);

    return { error };
  },

  async getPriceHistory(itemId: string) {
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("item_id", itemId)
      .order("recorded_at", { ascending: true });

    return { data, error };
  },

  subscribeToItems(
    familyGroupId: string,
    callback: (payload: unknown) => void,
  ) {
    return supabase
      .channel(`grocery_items:${familyGroupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grocery_items",
          filter: `family_group_id=eq.${familyGroupId}`,
        },
        callback,
      )
      .subscribe();
  },
};
