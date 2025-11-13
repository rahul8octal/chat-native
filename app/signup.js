import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import api from "../utils/api";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async() => {
      try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      // Save token
      await AsyncStorage.setItem("token", res.data.token);

      // Navigate to Chats
       router.replace("/(tabs)/home");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Invalid email or password");
    }
  };

  return (
    <View className="flex-1 justify-center bg-gray-100 px-6">
      <Text className="text-3xl font-bold text-center mb-8">Create Account 📝</Text>

      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-white"
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-white"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-6 bg-white"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-green-600 py-3 rounded-xl mb-3"
        onPress={handleSignup}
      >
        <Text className="text-white text-center text-lg font-semibold">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text className="text-center text-blue-600 mt-2">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}