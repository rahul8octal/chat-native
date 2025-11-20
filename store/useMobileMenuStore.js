import { create } from "zustand";

const useMobileMenuStore = create((set) => ({
  chatMenuIsOpen: true,
  setChatMenuIsOpen: (isOpen) => set({ chatMenuIsOpen: isOpen }),
  settingMenuIsOpen: true,
  setSettingMenuIsOpen: (isOpen) => set({ settingMenuIsOpen: isOpen }),
}));

export default useMobileMenuStore;
