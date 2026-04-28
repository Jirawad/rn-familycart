import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { groceryService } from "../lib/supabase";
import { FamilyGroup, GroceryItem } from "../src";

interface AppContextType {
  familyGroup: FamilyGroup | null;
  memberName: string;
  items: GroceryItem[];
  loading: boolean;
  isDarkMode: boolean;
  setFamilyGroup: (group: FamilyGroup | null) => void;
  setMemberName: (name: string) => void;
  toggleDarkMode: () => void;
  refreshItems: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FAMILY_GROUP: "@family_group",
  MEMBER_NAME: "@member_name",
  DARK_MODE: "@dark_mode",
};

// Helper สำหรับจัดการ Storage
const getItem = async (key: string) => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.localStorage.getItem(key);
  }
  return await AsyncStorage.getItem(key);
};

const setItem = async (key: string, value: string) => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

const removeItem = async (key: string) => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [familyGroup, setFamilyGroupState] = useState<FamilyGroup | null>(null);
  const [memberName, setMemberNameState] = useState<string>("");
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  // ดึงข้อมูลเมื่อมีการเปลี่ยนกลุ่มครอบครัว
  useEffect(() => {
    if (!familyGroup?.id) return;

    refreshItems();

    const subscription = groceryService.subscribeToItems(familyGroup.id, () => {
      refreshItems();
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [familyGroup?.id]);

  const restoreSession = async () => {
    try {
      const storedGroup = await getItem(STORAGE_KEYS.FAMILY_GROUP);
      const storedName = await getItem(STORAGE_KEYS.MEMBER_NAME);
      const storedDarkMode = await getItem(STORAGE_KEYS.DARK_MODE);

      if (storedGroup) setFamilyGroupState(JSON.parse(storedGroup));
      if (storedName) setMemberNameState(storedName);

      // ตรวจเช็กค่า Dark Mode ที่บันทึกไว้
      if (storedDarkMode !== null) {
        setIsDarkMode(storedDarkMode === "true");
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    }
  };

  const setFamilyGroup = async (group: FamilyGroup | null) => {
    setFamilyGroupState(group);
    if (group) {
      await setItem(STORAGE_KEYS.FAMILY_GROUP, JSON.stringify(group));
    } else {
      await removeItem(STORAGE_KEYS.FAMILY_GROUP);
    }
  };

  const setMemberName = async (name: string) => {
    setMemberNameState(name);
    await setItem(STORAGE_KEYS.MEMBER_NAME, name);
  };

  // ฟังก์ชันสลับ Dark Mode และบันทึกลงเครื่องทันที
  const toggleDarkMode = async () => {
    setIsDarkMode((prev) => {
      const nextMode = !prev;
      setItem(STORAGE_KEYS.DARK_MODE, String(nextMode));
      return nextMode;
    });
  };

  const refreshItems = async () => {
    if (!familyGroup?.id) return;
    setLoading(true);
    try {
      const { data, error } = await groceryService.getItems(familyGroup.id);
      if (!error && data) setItems(data as GroceryItem[]);
    } catch (err) {
      console.error("Refresh Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await removeItem(STORAGE_KEYS.FAMILY_GROUP);
    await removeItem(STORAGE_KEYS.MEMBER_NAME);
    setFamilyGroupState(null);
    setMemberNameState("");
    setItems([]);
  };

  return (
    <AppContext.Provider
      value={{
        familyGroup,
        memberName,
        items,
        loading,
        isDarkMode,
        setFamilyGroup,
        setMemberName,
        toggleDarkMode,
        refreshItems,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export default AppProvider;
