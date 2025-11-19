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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../utils/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import Checkbox from "expo-checkbox";
import { connectSocketWithToken } from "../lib/socket";
import { useSocket } from "../context/SocketContext";

type LoginResponse = {
  token?: string;
};

type LoginSocketContext = {
  isConnected?: boolean;
  hasInitialUserData?: boolean;
  requestUserData?: () => void;
  resetContextState?: () => void;
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFallbackFired, setSyncFallbackFired] = useState<boolean>(false);
  const socketContext = useSocket() as LoginSocketContext;
  const {
    isConnected = false,
    requestUserData = () => {},
    hasInitialUserData = false,
    resetContextState = () => {},
  } = socketContext;

  useEffect(() => {
    if (!isSyncing || !isConnected) return;
    requestUserData();
  }, [isSyncing, isConnected, requestUserData]);

  useEffect(() => {
    if (!isSyncing || !isConnected) return;
    const timer = setTimeout(() => setSyncFallbackFired(true), 4000);
    return () => clearTimeout(timer);
  }, [isSyncing, isConnected]);

  useEffect(() => {
    if (!isSyncing) return;
    if (!hasInitialUserData && !syncFallbackFired) return;
    setIsSyncing(false);
    setSyncFallbackFired(false);
    router.replace("/home");
  }, [hasInitialUserData, syncFallbackFired, isSyncing, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Enter credentials");
      return;
    }

    setIsSubmitting(true);
    setSyncFallbackFired(false);

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const token = res.data?.token;
      if (!token) {
        throw new Error("Missing auth token");
      }

      await AsyncStorage.setItem("token", token);
      resetContextState();
      setIsSyncing(true);
      await connectSocketWithToken();
    } catch (error) {
      const err = error as { response?: { data?: unknown; message?: string }; message?: string };
      console.log(err.response?.data || err.message);
      Alert.alert("Invalid email or password");
      setIsSyncing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionDisabled = isSubmitting || isSyncing;
  const buttonLabel = isSubmitting
    ? "Signing in..."
    : isSyncing
    ? "Syncing chats..."
    : "Sign In";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <View className="flex-row items-center space-x-3">
              <Image
                source={require("../assets/images/octal.png")}
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
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                  Password
                </Text>
                <TouchableOpacity>
                  <Text className="text-xs font-semibold text-indigo-500">
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
                    <AntDesign name="eye-invisible" size={22} color="#6366F1" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Checkbox
                  value={remember}
                  onValueChange={setRemember}
                  color={remember ? "#4F46E5" : undefined}
                />
                <Text className="ml-2 text-sm text-gray-700">Remember me</Text>
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

            {isSyncing ? (
              <View className="flex-row items-center justify-center mt-3 space-x-2">
                <ActivityIndicator size="small" color="#6366F1" />
                <Text className="text-sm text-indigo-500 font-medium">
                  Connecting to chat server...
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-8">
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="text-center text-gray-600">
                Don’t have an account?{" "}
                <Text className="text-indigo-500 font-semibold">Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
