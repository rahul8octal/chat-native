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
  ImageBackground,
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

export default function Signup() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showPassSecond, setShowPassSecond] = useState(false);
  const [remember, setRemember] = useState(false);

  const [user, setUser] = useState({
    email: "",
    contact_no: "",
    username: "",
    password: "",
    confirm_password: "",
    location: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(false);

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
      formData.append("profile_picture", user.profile_picture);
    }

    try {
      const response = await api.post("/auth/register", formData, {
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
      const apiError =
        typeof error === "object" && error !== null
          ? error
          : { response: null };
      const apiMessage = apiError?.response?.data?.message;
      Alert.alert("Signup Failed", apiMessage || "Try again!");
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
        <ImageBackground
          source={{
            uri: "data:image/jpeg;base64,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",
          }}
          className="flex-1"
          resizeMode="cover"
        >
          <ScrollView
            contentContainerClassName="flex-grow px-6 py-10 mt-5"
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center mb-6 ">
              <View className="flex-row items-center space-x-3 mr-4">
                <Image
                  source={require("../assets/octal8.png")}
                  style={{ width: 48, height: 48 }}
                />
                <Text className="text-gray-800 text-4xl font-extrabold  ">
                  Octal Chat
                </Text>
              </View>
              <Text className="text-2xl font-semibold text-center text-gray-800 mt-5">
                Create Account
              </Text>
              <Text className="text-base text-gray-500 text-center mt-2 px-6">
                Join the community and start collaborating with your team
                instantly.
              </Text>
            </View>

            <View className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-indigo-100 px-5 py-6 space-y-6 mb-5">
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
                    {user.profile_picture
                      ? "Change photo"
                      : "Add profile photo"}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Helps teammates recognize you instantly.
                  </Text>
                </View>
              </TouchableOpacity>

              <View>
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase mt-2">
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
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase mt-2">
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
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase mt-2">
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
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase mt-2">
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
                      <AntDesign
                        name="eye-invisible"
                        size={20}
                        color="#4F46E5"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase mt-2">
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
                  <TouchableOpacity
                    onPress={() => setShowPassSecond(!showPassSecond)}
                  >
                    {showPassSecond ? (
                      <AntDesign name="eye" size={20} color="gray" />
                    ) : (
                      <AntDesign
                        name="eye-invisible"
                        size={20}
                        color="#4F46E5"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="ml-1 text-sm font-semibold text-gray-500 uppercase mt-2">
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

              <View className="flex-row items-start mt-2 ml-2">
                <Checkbox
                  value={remember}
                  onValueChange={setRemember}
                  color={remember ? "#4F46E5" : undefined}
                  style={{ marginTop: 4 }}
                />
                <Text className="ml-2 mb-2 text-sm text-gray-600 flex-1">
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

            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="mb-10"
            >
              <Text className="text-center text-gray-600">
                Already have an account?{" "}
                <Text className="text-indigo-500 font-semibold">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
