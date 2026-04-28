// ชุดสี Light Mode
export const Colors = {
  primary: "#2D6A4F",
  primaryLight: "#52B788",
  primaryPale: "#D8F3DC",
  primaryDark: "#1B4332",

  accent: "#F4A261",
  accentLight: "#FFDDD2",
  accentDark: "#E76F51",

  success: "#52B788",
  warning: "#F4A261",
  danger: "#E63946",
  dangerLight: "#FFE8EA",
  info: "#4CC9F0",

  background: "#F8FAF9",
  surface: "#FFFFFF",
  surfaceElevated: "#F0F7F4",
  border: "#E2EDE8",

  text: "#1A2E27",
  textSecondary: "#5C7A6E",
  textMuted: "#9DB8B0",
  textInverse: "#FFFFFF",

  categoryColors: [
    "#52B788",
    "#F4A261",
    "#4CC9F0",
    "#E63946",
    "#9B5DE5",
    "#F15BB5",
    "#FEE440",
    "#00BBF9",
  ],
};

// dark mode colors
export const DarkColors = {
  primary: "#52B788",
  primaryLight: "#74C69D",
  primaryPale: "#1A2E26",
  primaryDark: "#D8F3DC",

  accent: "#FFD166",
  accentLight: "#2D2A1E",
  accentDark: "#F4A261",

  success: "#74C69D",
  warning: "#FFD166",
  danger: "#FF8B94",
  dangerLight: "#2D1B1E",
  info: "#4CC9F0",

  background: "#0F172A",
  surface: "#1E293B",
  surfaceElevated: "#334155",
  border: "#1E293B",

  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textInverse: "#0F172A",

  categoryColors: [
    "#52B788",
    "#FFD166",
    "#4CC9F0",
    "#FF8B94",
    "#9B5DE5",
    "#F15BB5",
    "#74C69D",
    "#00BBF9",
  ],
};

export const Typography = {
  fontFamily: {
    regular: "Kanit-Regular",
    medium: "Kanit-Medium",
    bold: "Kanit-Bold",
  },

  display: "Kanit-Bold",
  body: "Kanit-Regular",

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 34,
  },

  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
