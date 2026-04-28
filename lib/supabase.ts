// src/lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native"; // เพิ่มตัวนี้เข้ามาเช็กระบบ
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://cxwpdyitvhydjnkweeiy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vdOSTShi2wuOGz8A_iMBww_R6EQH_ub";

// แก้ไขส่วนสร้าง Client เพื่อรองรับ Web
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // ถ้าเป็นเว็บให้ใช้ localStorage ของ Browser ถ้าเป็นมือถือให้ใช้ AsyncStorage
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
   * Join an existing family group using access code
   */
  async joinByCode(accessCode: string) {
    const { data, error } = await supabase
      .from("family_groups")
      .select("*")
      .eq("access_code", accessCode.toUpperCase().trim())
      .single();

    return { data, error };
  },

  /**
   * Create a new family group
   */
  async create(name: string, accessCode: string) {
    const { data, error } = await supabase
      .from("family_groups")
      .insert([{ name, access_code: accessCode.toUpperCase().trim() }])
      .select()
      .single();

    return { data, error };
  },
};

// ============================================================
// GROCERY ITEM OPERATIONS
// ============================================================

export const groceryService = {
  /**
   * Fetch all items for a family group
   */
  async getItems(familyGroupId: string) {
    const { data, error } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("family_group_id", familyGroupId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  /**
   * Add a new grocery item
   */
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

  /**
   * Update an existing grocery item
   */
  async updateItem(
    id: string,
    updates: Partial<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
      frequency: string;
      current_price: number;
      previous_price: number;
      status: string;
      notes: string;
      purchased_at: string;
      purchased_by: string;
    }>,
  ) {
    const { data, error } = await supabase
      .from("grocery_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Toggle item purchase status
   */
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
      // Get current price to save as previous
      const { data: currentItem } = await supabase
        .from("grocery_items")
        .select("current_price")
        .eq("id", id)
        .single();

      if (
        currentItem?.current_price !== undefined &&
        currentItem?.current_price !== null
      ) {
        updates.previous_price = currentItem.current_price;
      }

      updates.current_price = newPrice;

      // Record price history
      try {
        await supabase.from("price_history").insert([
          {
            item_id: id,
            price: newPrice,
            recorded_by: memberName,
          },
        ]);
      } catch (e) {
        console.log("Price history table might not exist, skipping...");
      }
    }

    const { data, error } = await supabase
      .from("grocery_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Delete a grocery item
   */
  async deleteItem(id: string) {
    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("id", id);

    return { error };
  },

  /**
   * Get price history for an item
   */
  async getPriceHistory(itemId: string) {
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("item_id", itemId)
      .order("recorded_at", { ascending: true });

    return { data, error };
  },

  /**
   * Subscribe to real-time changes
   */
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
