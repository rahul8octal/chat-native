import { Feather, FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSocket } from "../context/SocketContext";
import { useEffect } from "react";

export default function Contacts() {
  const { socket, contacts } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.emit("get-contacts");
    }
  }, [socket]);

  const Item = ({ data }) => (
    <TouchableOpacity 
      className="flex-row border border-gray-100 p-3 rounded-xl gap-3 mb-3 items-center"
      onPress={() => {
        // Handle contact selection if needed, e.g., start chat
        // For now just logging or doing nothing as per request "setContacts"
        console.log("Selected contact:", data);
      }}
    >
   
      <View>
    
        <Image
          source={{
            uri: data.profile_image || `https://ui-avatars.com/api/?name=${data.username || "User"}&background=random`,
          }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
      </View>
      <View>
        <Text className="font-bold text-lg">{data.name || "Unknown"}</Text>
        <Text className="text-gray-500">{data.about || "Available"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 justify-between">
        <View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 flex-row items-center"
          >
            <Feather name="arrow-left" size={24} color="#16a34a" />
            <View  className="ml-2">
            <Text className="text-xl font-semibold text-green-700">Select Contact</Text>
            <Text className="">22 contacts</Text>
            </View>
           
          </TouchableOpacity>
        </View>
      

        <View className="flex-row gap-4">
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="ml-4">
          <View className="flex-row  p-3 rounded-xl gap-3  items-center">
            <Text className=" bg-green-600 p-2  rounded-full"><MaterialIcons name="group-add" size={24} color="white" /></Text>
            <Text className="">New group</Text>
          </View>
          <View className="flex-row  p-3 rounded-xl gap-3  items-center">
            <Text className=" bg-green-600 p-2  rounded-full"><MaterialIcons name="person-add-alt-1" size={24} color="white" /></Text>
            <Text className="">New contact</Text>
          </View>
          <View className="flex-row  p-3 rounded-xl gap-3  items-center">
            <Text className=" bg-green-600 p-2  rounded-full"><FontAwesome name="users" size={22} color="white" /></Text>
            <Text className="">New community</Text>
          </View>
        </View>
      <FlatList
        data={contacts}
        renderItem={({ item }) => <Item data={item} />}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
            <Text className="text-gray-500">No contacts found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
