import { create } from "zustand";
import type { ActiveView } from "../Types/home";

export type SelectedChat = { id: string; type: "user" | "group" } | null;

interface ControllerState {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  selectedChat: SelectedChat;
  setSelectedChat: (chat: SelectedChat) => void;
}

const useControllerStore = create<ControllerState>((set) => ({
  activeView: "chats",
  setActiveView: (view) => set({ activeView: view }),

  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));

export default useControllerStore;
