import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import type { IUser } from "@/Types";
import { create } from "zustand";

interface AuthStoreType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: IUser, token?: string) => void;
  verify: (user: IUser, status: boolean) => void;
  logout: () => void;
  setUser: (user: Partial<IUser>) => void;
  gotoLogin: () => void;
  clearCache: () => void;
}

const useAuthStore = create<AuthStoreType>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    if (token) void AsyncStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  verify: (user, status) => set({ user, isAuthenticated: status }),

  clearCache: () => {},

  logout: () => {
    void AsyncStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (partialUser) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partialUser } : (partialUser as IUser),
    })),

  gotoLogin: () => {
    void AsyncStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
    router.replace("/login");
  },
}));

export default useAuthStore;
