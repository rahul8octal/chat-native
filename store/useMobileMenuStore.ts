import { create } from "zustand";

interface MobileMenuState {
  chatMenuIsOpen: boolean;
  setChatMenuIsOpen: (isOpen: boolean) => void;

  settingMenuIsOpen: boolean;
  setSettingMenuIsOpen: (isOpen: boolean) => void;
}

const useMobileMenuStore = create<MobileMenuState>((set) => ({
  chatMenuIsOpen: true,
  setChatMenuIsOpen: (isOpen) => set({ chatMenuIsOpen: isOpen }),
  settingMenuIsOpen: true,
  setSettingMenuIsOpen: (isOpen) => set({ settingMenuIsOpen: isOpen }),
}));

export default useMobileMenuStore;
