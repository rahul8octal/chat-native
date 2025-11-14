import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../utils/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import Checkbox from "expo-checkbox";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
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
      <View className="flex-row pl-20 pb-4 ">
        <Image
          source={require("../assets/images/octal.png")}
          style={{ width: 40, height: 40 }}
        />
        <Text className="text-gray-700 text-4xl font-bold ">Octal Chat</Text>
      </View>
      <Text className="text-3xl font-bold text-center text-gray-700">
        Sign Into Your Account
      </Text>
      <Text className="text-xl  text-gray-500 text-center mb-5">
        Sign in to continue to your account
      </Text>
      <View className="  border border-gray-300 rounded-xl px-3 py-3 mb-3 bg-gray-50">
        <Text className="ml-2 text-xl font-semibold text-gray-500">Email</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2 mb-3 bg-white">
         
          <AntDesign name="user" size={20} color="gray" />
          <TextInput
            placeholder="Email"
            className="flex-1 ml-3 text-base text-gray-800"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        <Text className="ml-2 text-xl font-semibold text-gray-500">Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2 mb-3 bg-white">
          <AntDesign name="lock" size={20} color="gray" className="" />

          <TextInput
            placeholder="Password"
            className="flex-1 ml-3 text-base text-gray-900"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            {showPass ? (
              <AntDesign name="eye" size={24} color="gray" />
            ) : (
              <AntDesign name="eye-invisible" size={24} color="mediumslateblue" />
            )}
          </TouchableOpacity>
        </View>
        <View>
          <View className="flex-row  mb-5">
            <Checkbox
              value={remember}
              onValueChange={setRemember}
              color={remember ? "#4F46E5" : undefined}
            />
            <Text className="ml-2 text-gray-900">Remember me</Text>
          </View>

          <TouchableOpacity
            className="bg-indigo-400 py-3  rounded-2xl font-bold"
            onPress={handleLogin}
            
          >
            <Text className="text-white text-center text-xl" >Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-center text-gray-600 mt-2 ">
              Don’t have an account?{" "}
              <Text className="text-indigo-600">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
