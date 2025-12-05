import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../utils/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import Checkbox from "expo-checkbox";
import { connectSocketWithToken } from "../lib/socket";
import useAuthStore from "@/store/useAuthStore";

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Enter credentials");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      if (!res) return;
      login(res.data.data, res.data?.token || "");
      connectSocketWithToken();
      router.replace("/home");
    } catch (err) {
      console.error("Login error:", err);
      let message = "Something went wrong. Please try again.";

      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      else if (typeof err === "object" && err !== null)
        message = err.message || JSON.stringify(err);
      Alert.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionDisabled = isSubmitting;
  const buttonLabel = isSubmitting ? "Signing in..." : "Sign In";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ImageBackground
          source={{
            uri: "data:image/jpeg;base64,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",
          }}
          className="flex-1"
          resizeMode="cover"
        >
          <ScrollView
            contentContainerClassName="flex-grow justify-center px-6 py-10"
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center mb-8">
              <View className="flex-row items-center space-x-3">
                <Image
                  source={require("../assets/octal8.png")}
                  style={{ width: 48, height: 48 }}
                />
                <Text className="text-gray-800 text-4xl font-extrabold">
                  Octal Chat
                </Text>
              </View>
              <Text className="text-2xl font-semibold text-center text-gray-800 mt-6">
                Welcome back 👋
              </Text>
              <Text className="text-base text-gray-500 text-center mt-2 px-6">
                Sign in to pick up conversations exactly where you left off.
              </Text>
            </View>

            <View className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-indigo-100 px-5 py-6 space-y-5">
              <View>
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                  Email
                </Text>
                <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                  <AntDesign name="user" size={20} color="gray" />
                  <TextInput
                    placeholder="you@email.com"
                    className="flex-1 ml-3 text-base text-gray-900"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between items-center pr-1">
                  <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase mt-3">
                    Password
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-xs font-semibold text-indigo-500 mt-2">
                      Forgot?
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                  <AntDesign name="lock" size={20} color="gray" />
                  <TextInput
                    placeholder="Enter password"
                    className="flex-1 ml-3 text-base text-gray-900"
                    secureTextEntry={!showPass}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    {showPass ? (
                      <AntDesign name="eye" size={22} color="gray" />
                    ) : (
                      <AntDesign
                        name="eye-invisible"
                        size={22}
                        color="#6366F1"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center ml-2 mt-3 mb-3">
                  <Checkbox
                    value={remember}
                    onValueChange={setRemember}
                    color={remember ? "#4F46E5" : undefined}
                  />
                  <Text className="ml-2 text-sm text-gray-700">
                    Remember me
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">
                  Secure and encrypted login
                </Text>
              </View>

              <TouchableOpacity
                className={`py-4 rounded-2xl ${
                  actionDisabled ? "bg-indigo-300" : "bg-indigo-500"
                }`}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={actionDisabled}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5">
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text className="text-center text-gray-600">
                  Don’t have an account?{" "}
                  <Text className="text-indigo-500 font-semibold">Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
