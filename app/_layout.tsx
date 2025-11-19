import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SocketProvider } from "../context/SocketContext";
import "./global.css";

export default function RootLayout() {
  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SocketProvider>
  );
}
