import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Feather from "@expo/vector-icons/Feather";
import Checkbox from "expo-checkbox";
import api from "../utils/api";

type ProfileImage = {
  uri: string;
  type: string;
  name: string;
};

type SignupFormState = {
  email: string;
  contact_no: string;
  username: string;
  password: string;
  confirm_password: string;
  location: string;
  profile_picture: ProfileImage | null;
};

type SignupResponse = {
  token?: string;
};

export default function Signup() {
  const router = useRouter();
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showPassSecond, setShowPassSecond] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(false);

  const [user, setUser] = useState<SignupFormState>({
    email: "",
    contact_no: "",
    username: "",
    password: "",
    confirm_password: "",
    location: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setUser((prev) => ({
        ...prev,
        profile_picture: {
          uri: asset.uri,
          type: asset.mimeType ?? "image/jpeg",
          name: asset.fileName ?? "profile.jpg",
        },
      }));
    }
  };

  const handleSignup = async () => {
    if (
      !user.email ||
      !user.password ||
      !user.confirm_password ||
      !user.username
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("contact_no", user.contact_no);
    formData.append("username", user.username);
    formData.append("password", user.password);
    formData.append("confirm_password", user.confirm_password);
    formData.append("location", user.location);
    if (user.profile_picture) {
      formData.append("profile_picture", user.profile_picture as unknown as Blob);
    }

    try {
      const response = await api.post<SignupResponse>("/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
      }

      Alert.alert("Success", "Signup successfully!");
      router.replace("/home");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.log(err.response?.data || err);
      Alert.alert("Signup Failed", err.response?.data?.message || "Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-6">
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
              Create Account
            </Text>
            <Text className="text-base text-gray-500 text-center mt-2 px-6">
              Join the community and start collaborating with your team instantly.
            </Text>
          </View>

          <View className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-indigo-100 px-5 py-6 space-y-6 mb-6">
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              className="border border-dashed border-indigo-300 rounded-2xl p-4 flex-row items-center"
            >
              {user.profile_picture ? (
                <Image
                  source={{ uri: user.profile_picture.uri }}
                  style={{ width: 56, height: 56, borderRadius: 999 }}
                />
              ) : (
                <View className="w-14 h-14 rounded-full bg-indigo-100 items-center justify-center">
                  <Feather name="camera" size={22} color="#4F46E5" />
                </View>
              )}
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  {user.profile_picture ? "Change photo" : "Add profile photo"}
                </Text>
                <Text className="text-xs text-gray-500">
                  Helps teammates recognize you instantly.
                </Text>
              </View>
            </TouchableOpacity>

            <View>
              <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                Email
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                <MaterialCommunityIcons
                  name="email-outline"
                  size={22}
                  color="gray"
                />
                <TextInput
                  placeholder="you@email.com"
                  className="flex-1 ml-3 text-base text-gray-900"
                  value={user.email}
                  onChangeText={(text) =>
                    setUser((prev) => ({ ...prev, email: text }))
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View>
              <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                Username
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                <Feather name="user" size={20} color="gray" />
                <TextInput
                  placeholder="Choose a username"
                  className="flex-1 ml-3 text-base text-gray-900"
                  value={user.username}
                  onChangeText={(text) =>
                    setUser((prev) => ({ ...prev, username: text }))
                  }
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View>
              <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                Contact Number
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                <MaterialIcons
                  name="perm-contact-calendar"
                  size={20}
                  color="gray"
                />
                <TextInput
                  placeholder="Optional"
                  className="flex-1 ml-3 text-base text-gray-900"
                  value={user.contact_no}
                  keyboardType="phone-pad"
                  onChangeText={(text) =>
                    setUser((prev) => ({ ...prev, contact_no: text }))
                  }
                />
              </View>
            </View>

            <View>
              <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                Password
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                <AntDesign name="lock" size={20} color="gray" />
                <TextInput
                  placeholder="Enter password"
                  className="flex-1 ml-3 text-base text-gray-900"
                  value={user.password}
                  secureTextEntry={!showPass}
                  onChangeText={(text) =>
                    setUser((prev) => ({ ...prev, password: text }))
                  }
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  {showPass ? (
                    <AntDesign name="eye" size={20} color="gray" />
                  ) : (
                    <AntDesign name="eye-invisible" size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                Confirm Password
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                <AntDesign name="lock" size={20} color="gray" />
                <TextInput
                  placeholder="Re-type password"
                  className="flex-1 ml-3 text-base text-gray-900"
                  value={user.confirm_password}
                  secureTextEntry={!showPassSecond}
                  onChangeText={(text) =>
                    setUser((prev) => ({ ...prev, confirm_password: text }))
                  }
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setShowPassSecond(!showPassSecond)}>
                  {showPassSecond ? (
                    <AntDesign name="eye" size={20} color="gray" />
                  ) : (
                    <AntDesign name="eye-invisible" size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase">
                Location
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 mt-2 bg-gray-50">
                <SimpleLineIcons name="location-pin" size={20} color="gray" />
                <TextInput
                  placeholder="City, Country"
                  className="flex-1 ml-3 text-base text-gray-900"
                  value={user.location}
                  onChangeText={(text) =>
                    setUser((prev) => ({ ...prev, location: text }))
                  }
                />
              </View>
            </View>

            <View className="flex-row items-start">
              <Checkbox
                value={remember}
                onValueChange={setRemember}
                color={remember ? "#4F46E5" : undefined}
                style={{ marginTop: 4 }}
              />
              <Text className="ml-2 text-sm text-gray-600 flex-1">
                Keep me signed in on this device and send me product tips.
              </Text>
            </View>

            <TouchableOpacity
              disabled={loading}
              onPress={handleSignup}
              className={`py-4 rounded-2xl ${
                loading ? "bg-indigo-300" : "bg-indigo-500"
              }`}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Create account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text className="text-center text-gray-600">
              Already have an account?{" "}
              <Text className="text-indigo-500 font-semibold">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
