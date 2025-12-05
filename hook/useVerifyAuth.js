// hooks/useVerifyAuth.ts
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "@/store/useAuthStore";
import Constants from "expo-constants";

const API_BASE = Constants?.expoConfig?.extra?.apiUrl ?? ""; 

export default function useVerifyAuth() {
  const [checked, setChecked] = useState(false);
  const [validSession, setValidSession] = useState(false);

  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const verify = useAuthStore((s) => s.verify);
  const logout = useAuthStore((s) => s.logout);
  const gotoLogin = useAuthStore((s) => s.gotoLogin);

  useEffect(() => {
    let mounted = true;

    async function verifyAuth() {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          // no token -> redirect to login (store.gotologin will clear token and route)
          if (mounted) {
            setValidSession(false);
            setChecked(true);
            // don't call gotoLogin here automatically — you may prefer navigation at the index
            // but we expose gotoLogin so callers can use it. For parity with web, call verify->gotoLogin
            // we'll not call gotoLogin automatically to avoid double navigations.
          }
          return;
        }

        // call /auth/me
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!mounted) return;

        if (res.ok) {
          const data = await res.json();
          // API shape: { user: {...} } or user directly — handle both
          const u = data?.user ?? data;

          if (u) {
            // set store: use login so store.token also gets set
            login(u, token);
            verify(u, true);
            setValidSession(true);
          } else {
            // unexpected shape
            logout();
            setValidSession(false);
          }
        } else {
          // token invalid / expired
          logout();
          setValidSession(false);
        }
      } catch (err) {
        // network or parse error
        logout();
        setValidSession(false);
      } finally {
        if (mounted) setChecked(true);
      }
    }

    // small timeout to allow other start-up tasks (mirrors your web implementation)
    const t = setTimeout(verifyAuth, 50);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [login, verify, logout]);

  return { checked, validSession, user, logout, gotoLogin };
}
