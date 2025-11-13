import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../utils/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

     if (!email || !password) return alert("Enter credentials");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // Save token
      await AsyncStorage.setItem("token", res.data.token);

      // Navigate to Chats
       router.replace("/home");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Invalid email or password");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-8">Login</Text>

      <TextInput
        placeholder="Email"
        className="border px-4 py-3 rounded mb-3"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        className="border px-4 py-3 rounded mb-3"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-green-600 py-3 rounded"
        onPress={handleLogin}
      >
        <Text className="text-white text-center text-lg">Login</Text>
      </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text className="text-center text-blue-600 mt-2">
          Don’t have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
