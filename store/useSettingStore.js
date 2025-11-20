import { create } from "zustand";

const useSettingsStore = create((set) => ({
  activeSettings: "profile",
  setActiveSettings: (view) => set({ activeSettings: view }),
}));

export default useSettingsStore;
