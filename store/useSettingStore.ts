import { create } from "zustand";
export type ActiveSetting = "profile" | "privacy" | "help";

interface SettingState {
  activeSettings: ActiveSetting;
  setActiveSettings: (view: ActiveSetting) => void;
}

const useSettingsStore = create<SettingState>((set) => ({
  activeSettings: "profile",
  setActiveSettings: (view) => set({ activeSettings: view }),
}));

export default useSettingsStore;
