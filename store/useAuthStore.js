import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { create } from "zustand";

const useAuthStore = create((set) => ({
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
			user: state.user ? { ...state.user, ...partialUser } : partialUser ?? null,
		})),

	gotoLogin: () => {
		void AsyncStorage.removeItem("token");
		set({ user: null, token: null, isAuthenticated: false });
		router.replace("/login");
	},
}));

export default useAuthStore;
