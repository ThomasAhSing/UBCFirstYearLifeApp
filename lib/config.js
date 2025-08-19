const FALLBACK_API = "https://ubcfirstyearlifeapp.onrender.com";

export const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE_URL || "").trim() || FALLBACK_API;

export const APP_SCHEME = "ubcfirstyearlifeapp";