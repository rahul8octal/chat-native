import useAuthStore from "@/store/useAuthStore";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5, Feather, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { disconnectSocket } from "../lib/socket";

const SETTINGS_OPTIONS = [
  {
    category: "account",
    items: [
      {
        id: "account",
        icon: <MaterialCommunityIcons name="key-outline" size={22} color="black" />,
        title: "Account",
        subtitle: "Security notification, change number",
      },
      {
        id: "privacy",
        icon: <MaterialCommunityIcons name="lock-outline" size={24} color="black" />,
        title: "Privacy",
        subtitle: "Block contact",
      },
      {
        id: "avatar",
        icon: <MaterialCommunityIcons name="face-woman-shimmer-outline" size={24} color="black" />,
        title: "Avatar",
        subtitle: "Create, edit, profile photo",
      },
    ],
  },
  {
    category: "general",
    items: [
      {
        id: "lists",
        icon: <FontAwesome name="users" size={22} color="black" />,
        title: "Lists",
        subtitle: "Manage people and groups",
      },
      {
        id: "chats",
        icon: <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />,
        title: "Chats",
        subtitle: "Chat history",
      },
      {
        id: "notifications",
        icon: <Ionicons name="notifications-outline" size={24} color="black" />,
        title: "Notifications",
        subtitle: "Manage groups and call tones",
      },
    ],
  },
  {
    category: "system",
    items: [
      {
        id: "storage",
        icon: <MaterialIcons name="settings-backup-restore" size={24} color="black" />,
        title: "Storage and data",
        subtitle: "Network usage",
      },
      {
        id: "language",
        icon: <MaterialIcons name="language" size={24} color="black" />,
        title: "App language",
        subtitle: "English",
      },
      {
        id: "help",
        icon: <Ionicons name="help-circle-outline" size={24} color="black" />,
        title: "Help and feedback",
        subtitle: "Help center, contact us, privacy policy",
      },
      {
        id: "invite",
        icon: <Feather name="users" size={21} color="black" />,
        title: "Invite friend",
        subtitle: "",
      },
    ],
  },
];

const SettingItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity onPress={onPress} className="pt-3 pb-3 pr-6 pl-6 flex-row gap-4 items-center">
    <View className="w-8 items-center">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-xl text-gray-800">{title}</Text>
      {subtitle ? <Text className="text-gray-500 text-sm">{subtitle}</Text> : null}
    </View>
  </TouchableOpacity>
);

export default function Setting() {
  const { user, gotoLogin } = useAuthStore();

  const handleLogout = async () => {
    await disconnectSocket();
    gotoLogin();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row px-4 py-3 justify-between bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="chevron-back" size={28} color="#16a34a" />
          </TouchableOpacity>
          <Text className="text-2xl ml-2">Settings</Text>
        </View>
        <TouchableOpacity className="p-1">
          <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Section */}
        <View className="bg-white px-6 py-4 mt-2 flex-row items-center border-b border-gray-200 justify-between">
          <View className="flex-row items-center gap-4 flex-1">
            <Image
              source={{
                uri: user?.profilePic || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpe30_YsS6a4vvaz2setu-IEBWpPsfH935KA&s",
              }}
              className="w-16 h-16 rounded-full bg-gray-200"
            />
            <View className="flex-1">
              <Text className="font-semibold text-2xl" numberOfLines={1}>
                {user?.name || "Urvisha"}
              </Text>
              <Text className="text-gray-500 text-lg" numberOfLines={1}>
                {user?.status || "Always be happy....."}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-4">
            <TouchableOpacity>
              <Ionicons name="qr-code" size={22} color="#16a34a" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="add-circle-outline" size={22} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Sections */}
        {SETTINGS_OPTIONS.map((section, index) => (
          <View key={section.category} className={`bg-white ${index > 0 ? "mt-2" : ""}`}>
            {section.items.map((item) => (
              <SettingItem
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={() => console.log(`Pressed ${item.id}`)}
              />
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View className="p-6 mb-10">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 border border-red-100 p-4 rounded-xl flex-row justify-center items-center gap-2"
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 text-lg font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
