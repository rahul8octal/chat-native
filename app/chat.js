import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image, ImageBackground,TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import background from '@/assets/background2.jpg';
import React, { useState } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
export default function Chat() {
  const router = useRouter();
  const [search, setSearch] = useState("");
 
  return (
    <ImageBackground
      source={background}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        
        {/* HEADER */}
        <View className="pt-3 pb-2 flex-row justify-between items-center bg-white">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="ml-3 mr-4"
              onPress={() => router.back()}
            >
              <FontAwesome5 name="arrow-left" size={20} color="black" />
            </TouchableOpacity>

            <Image
              source={require("../assets/logo1.jpeg")}
              className="w-10 h-10 rounded-full"
            />

            <View className="ml-3">
              <Text className="text-lg font-bold">Urvisha</Text>
              <Text className="text-gray-600 text-xs">last seen today..</Text>
            </View>
          </View>

          <View className="flex-row items-center  mr-3">
            <AntDesign name="video-camera" className="mr-2" size={22} color="black" />
            <Ionicons name="call-outline"  size={22} color="black" />
            <Entypo name="dots-three-vertical" size={22} color="black" />
          </View>
        </View>

    
        <View className="mt-5  ">
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
            <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          <View className="flex-row">
        <View className=" pl-5 w-40 h-10"><Text className="text-xl bg-green-300 pl-5 rounded-xl">hello...</Text></View>
          <View className="mt-10 ml-24 w-40 h-10 pl-5" ><Text  className="text-xl bg-green-300 pl-5 rounded-xl">helloo..</Text></View>
          </View>
          
        </View>
        <View className="flex-row items-center bg-white  mx-4 my-4 px-3  rounded-2xl mt-2">
        <TouchableOpacity onPress={() => setSearch("")}>
            <MaterialCommunityIcons name="sticker-emoji" size={24} color="black" />
            </TouchableOpacity>

          <TextInput
            placeholder="Message"
            value={search}
            onChangeText={setSearch}
            className="flex-1 px-2  text-base "
          />

           
           
          
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}
