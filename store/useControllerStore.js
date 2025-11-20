import { create } from "zustand";

const useControllerStore = create((set) => ({
  activeView: "chats",
  setActiveView: (view) => set({ activeView: view }),

  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));

export default useControllerStore;
