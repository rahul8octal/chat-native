import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";

export default function Signup() {
  const router = useRouter();

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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setUser({
        ...user,
        profile_picture: {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "profile.jpg",
        },
      });
    }
  };

  const handleSignup = async () => {
    if (!user.email || !user.password || !user.confirm_password || !user.username) {
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
      const response = await api.post("/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Save token if backend returns it
      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
      }

      Alert.alert("Success", "Signup successfully!");
      router.replace("/home");
    } catch (error) {
      console.log(error.response?.data || error);
      Alert.alert("Signup Failed", error.response?.data?.message || "Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-3xl font-bold mb-5">Create Account</Text>

      {/* Image Picker */}
      <TouchableOpacity
        onPress={pickImage}
        className="items-center justify-center mb-5"
      >
        {user.profile_picture ? (
          <Image
            source={{ uri: user.profile_picture.uri }}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-gray-600">Pick Image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Input Fields */}
      <TextInput
        placeholder="Email"
        className="border p-3 rounded mb-3"
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
      />

      <TextInput
        placeholder="Contact Number"
        className="border p-3 rounded mb-3"
        value={user.contact_no}
        keyboardType="phone-pad"
        onChangeText={(text) => setUser({ ...user, contact_no: text })}
      />

      <TextInput
        placeholder="Username"
        className="border p-3 rounded mb-3"
        value={user.username}
        onChangeText={(text) => setUser({ ...user, username: text })}
      />

      <TextInput
        placeholder="Password"
        className="border p-3 rounded mb-3"
        value={user.password}
        secureTextEntry
        onChangeText={(text) => setUser({ ...user, password: text })}
      />

      <TextInput
        placeholder="Confirm Password"
        className="border p-3 rounded mb-3"
        value={user.confirm_password}
        secureTextEntry
        onChangeText={(text) => setUser({ ...user, confirm_password: text })}
      />

      <TextInput
        placeholder="Location"
        className="border p-3 rounded mb-3"
        value={user.location}
        onChangeText={(text) => setUser({ ...user, location: text })}
      />

      {/* Signup Button */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleSignup}
        className="bg-green-600 p-3 rounded mt-2"
      >
        <Text className="text-white text-center text-lg">
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Go to Login */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text className="text-center text-blue-500 mt-4">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
