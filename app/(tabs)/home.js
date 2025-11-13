import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl mb-4">Home Screen</Text>

      <TouchableOpacity className="bg-red-600 p-3 rounded" onPress={logout}>
        <Text className="text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
