import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Feather from '@expo/vector-icons/Feather';
import api from "../utils/api";
import Checkbox from "expo-checkbox";


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
      Alert.alert(
        "Signup Failed",
        error.response?.data?.message || "Try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6  bg-white">
      <View className="flex-row pl-20 pb-3 ">
        <Image
          source={require("../assets/images/octal.png")}
          style={{ width: 40, height: 40 }}
        />
        <Text className="text-gray-700 text-4xl font-bold ">Octal Chat</Text>
      </View>
      <Text className="text-3xl font-bold text-center text-gray-700">
        Create Account
      </Text>
      <Text className="text-xl  text-gray-500 text-center mb-5">
        Get your Octal Chat account now.
      </Text>
      
      <View className="  border border-gray-300 rounded-xl px-3 py-2 mb-3 bg-gray-50">
        <Text className="ml-2 text-xl font-semibold text-gray-500">Email</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 mb-3">
          <MaterialCommunityIcons name="email-outline" size={24} color="gray" />
          <TextInput
            placeholder=" Enter Email"
            className=" ml-3 text-base text-gray-800"
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
          />
        </View>

        <View className="bg-gray-50">
          
            <Text className="ml-2 text-xl font-semibold text-gray-500">
              {" "}
              Username
            </Text>
       
        <View className="flex-row items-center border border-gray-300 rounded-xl px-3  mb-3 ">
            <Feather name="user" size={20} color="gray" />
            <TextInput
              placeholder="Enter Username"
              className=""
              value={user.username}
              onChangeText={(text) => setUser({ ...user, username: text })}
            />
          </View>
        </View>
          <View className="bg-gray-50">
            <Text className="ml-2 text-xl font-semibold text-gray-500">
              {" "}
              Contact Number
            </Text>
            <View className="flex-row border border-gray-300 items-center rounded-xl mb-3 px-3 ">
            <MaterialIcons name="perm-contact-calendar" size={22} color="gray" />
            <TextInput
              placeholder="Enter Contact Number"
              value={user.contact_no}
              keyboardType="phone-pad"
              onChangeText={(text) => setUser({ ...user, contact_no: text })}
            />
            </View>
          </View>
        
        <View className="bg-gray-50">
          <View>
            <Text className="ml-2 text-xl font-semibold text-gray-500">
              {" "}
              Password
            </Text>
            <View className="flex-row border border-gray-300 items-center rounded-xl mb-3 px-3 ">
            <AntDesign name="lock" size={20} color="gray" />
            <TextInput
              placeholder="Enter Password"
              className="pl-2"
              value={user.confirm_password}
              secureTextEntry
              onChangeText={(text) =>
                setUser({ ...user, confirm_password: text })
              }
            />
            <TouchableOpacity  className="pl-40" onPress={() => setShowPass(!showPass)}>
            {showPass ? (
              <AntDesign name="eye" size={20} color="gray" />
            ) : (
              <AntDesign name="eye-invisible" size={20} color="mediumslateblue" />
            )}
          </TouchableOpacity>
            </View>
          </View>
          </View>
    
          <View className="bg-gray-50">
            <Text className="ml-2 text-xl font-semibold text-gray-500">
            {" "}
              Confirm Password
            </Text>
            <View className="flex-row border border-gray-300  items-center rounded-xl mb-3 px-3">
            <AntDesign name="lock" size={20} color="gray" className="" />
            <TextInput
              placeholder="Confirm Password"
              value={user.password}
              secureTextEntry
              onChangeText={(text) => setUser({ ...user, password: text })}
            />
             <TouchableOpacity className="pl-36"   onPress={() => setShowPassSecond(!showPassSecond)}>
            {showPassSecond ? (
              <AntDesign name="eye" size={20} color="gray" />
            ) : (
              <AntDesign name="eye-invisible" size={20} color="mediumslateblue" />
            )}
          </TouchableOpacity>
            </View>
          </View>
        

        <View className="bg-gray-50">
          <Text className="ml-2 text-xl font-semibold text-gray-500">
            Location
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-3  mb-3 ">
            <SimpleLineIcons name="location-pin" size={24} color="gray" />
            <TextInput
              placeholder="Enter Your Location"
              className="  p-3  py-4"
              value={user.location}
              onChangeText={(text) => setUser({ ...user, location: text })}
            />
          </View>
        </View>

       
         <View>
                  <View className="flex-row ">
                    <Checkbox
                      value={remember}
                      onValueChange={setRemember}
                      color={remember ? "#4F46E5" : undefined}
                    />
                    <Text className="ml-2 text-gray-500">Remember me</Text>
                  </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handleSignup}
          className="bg-indigo-400 py-3  rounded-2xl font-bold mt-2"
        >
          <Text className="text-white text-center text-lg">
            {loading ? "Creating..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-center text-gray-600 mt-4">
            Already have an account?
            <Text className="text-indigo-600 ml-1">Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </View>
  
  );
}
