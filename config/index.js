import Constants from "expo-constants";

export const BASE_URL = Constants?.expoConfig?.extra?.apiUrl ?? "";
export const Socket_URL = BASE_URL.slice(0, BASE_URL.length - 4);
