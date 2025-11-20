// app/index.tsx
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import useVerifyAuth from "@/hook/useVerifyAuth";

export default function Index() {
  const router = useRouter();
  const { checked, validSession } = useVerifyAuth();

  useEffect(() => {
    if (!checked) return;
  
    if (validSession) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, [checked, validSession, router]);

  if (!checked) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
