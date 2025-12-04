import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from "react";

import logo1 from "@/assets/logo1.jpeg";
import logo2 from "@/assets/logo2.jpeg";
import logo3 from "@/assets/logo3.jpeg";
import logo4 from "@/assets/logo4.jpeg";
import logo5 from "@/assets/logo5.jpeg";
import logo6 from "@/assets/logo6.jpeg";
import logo7 from "@/assets/logo7.jpeg";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };
  const options = ["Option 1", "Option 2", "Option 3"];
  const Data = [
    {
      id: 1,
      name: "Urvisha",
      message: "Hello..",
      time: "Yesterday",
      url: logo1,
    },
    {
      id: 2,
      name: "Trisha",
      message: "Thank you..",
      time: "10:00pm",
      url: logo2,
    },
    {
      id: 3,
      name: "Rahul",
      message: "How are you..",
      time: "10:00pm",
      url: logo3,
    },
    {
      id: 4,
      name: "Reena",
      message: "Thank you...",
      time: "10:00pm",
      url: logo4,
    },
    {
      id: 5,
      name: "Mahi",
      message: "Thank you...",
      time: "10:00pm",
      url: logo5,
    },
    {
      id: 6,
      name: "Nakshu",
      message: "Thank you...",
      time: "10pm",
      url: logo6,
    },
    {
      id: 7,
      name: "Rahi",
      message: "Thank you...",
      time: "10:00pm",
      url: logo7,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white pt-10 ">
        <View className="flex-row justify-between">
          <Text className="font-bold text-2xl text-green-500 pl-4">
            WhatsApp
          </Text>
          <View className="flex-row">
            <View className="pr-2 pt-2">
              <Feather name="camera" size={24} color="black" />
            </View>
           
            <TouchableOpacity
              className=" mt-2 mr-3"
              onPress={logout}
            >
            <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
            </TouchableOpacity>
           </View>
        </View>
        
        <View className="flex-row items-center bg-gray-200 mx-4 my-4 px-3  rounded-2xl mt-2">
          <Ionicons name="search-outline" size={22} color="gray" />

          <TextInput
            placeholder="Ask Meta AI or Search..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 px-2  text-base "
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        <View className="flex-row mx-4 ">
          <TouchableOpacity className="bg-gray-200 p-3 rounded-3xl pl-4 mr-2">
            <Text className="text-gray-700">All</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-3 rounded-3xl pl-4 mr-2">
            <Text className="text-gray-700">Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-3 rounded-3xl pl-4 mr-2">
            <Text className="text-gray-700">Favourites</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-3 rounded-3xl pl-4 mr-2">
            <Text className="text-gray-700 ">Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 p-3  rounded-3xl pl-4">
            <Text className="text-gray-700 text-bold ">+</Text>
          </TouchableOpacity>
        </View>
       
        
      </View>
      
      
      <ScrollView contentContainerClassName="mx-4">
        <View>
          <FlatList
            data={Data}
            renderItem={({ item, index }) => {
              return (
                <View className="pt-5">
                  <TouchableOpacity className="pt-3 flex-row  justify-between bg-gray-100 rounded-2xl"
                  onPress={() =>
                    router.push({
                      pathname: "/chat",
                    })
                  }
                  >
                    <View className=" flex-row">
                      <Image
                        source={item.url}
                        style={{ width: 40, height: 40 }}
                        className="rounded-full"
                      />
                      <View className="pl-3">
                        <Text className="font-bold text-dark-500 mb-2">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 mb-4">
                          {item.message}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text>{item.time}</Text>
                    </View>
                  </TouchableOpacity>
                </View>



              );
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
