import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";

export default function Index() {
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const check = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      setToken(savedToken);
      setTokenLoaded(true);
    };
    check();
  }, []);

  if (!tokenLoaded) return null;

  return token ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
