import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../context/SocketContext";
import { useEffect } from "react";

const ActionButton = ({ icon, label }) => (
  <View className="border border-gray-300 py-3 px-6 rounded-xl items-center min-w-[85px]">
    <View className="mb-1">{icon}</View>
    <Text className="text-gray-600">{label}</Text>
  </View>
);

const OptionRow = ({ icon, title, subtitle, value, showBorder = true }) => (
  <View className={`mt-2 ${showBorder ? "" : "mb-2"}`}>
    <View className="py-3 px-6 flex-row gap-4 items-center">
      <View>{icon}</View>
      <View className="flex-1">
        <Text className="text-base text-gray-800">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-xs">{subtitle}</Text>}
      </View>
      {value && <Text className="text-gray-500">{value}</Text>}
    </View>
  </View>
);

export default function Profile() {
  const params = useLocalSearchParams();
  const { selectedProfileDetail, selectedProfileId, setSelectedProfileId } = useSocket();

  useEffect(() => {
    // If we have params but no state (e.g. on refresh), restore the state
    if (params.id && (!selectedProfileId || selectedProfileId.id !== params.id)) {
      setSelectedProfileId({ id: params.id, type: params.type || "user" });
    }
  }, [params.id, params.type, selectedProfileId]);

  const handleback = () => {
    setSelectedProfileId(null);
   router.push({ pathname: "/home" });
  };


  const profile = selectedProfileDetail || {
    username: "Loading...",
    contact: "",
    about: "",
    profile_image: null,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row px-4 py-3 justify-between bg-white items-center">
        <TouchableOpacity onPress={() => handleback()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#16a34a" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Info */}
        <View className="bg-white items-center pb-6">
          <Image
            source={{
              uri: profile.profile_image || `https://ui-avatars.com/api/?name=${profile.username || "User"}&background=random`,
            }}
            className="w-28 h-28 rounded-full bg-gray-200 mb-3"
          />
          <Text className="font-semibold text-2xl text-gray-900">{profile.username}</Text>
          <Text className="text-xl text-gray-600 mt-1">{profile.contact || profile.phone || "9574514762"}</Text>
          {profile.about && <Text className="text-base text-gray-500">{profile.about}</Text>}

          {/* Actions */}
          <View className="flex-row mt-6 gap-3 items-center justify-center  px-2">
            <TouchableOpacity>

            <ActionButton
              icon={<Ionicons name="call-outline" size={25} color="#16a34a" />}
              label="Audio"
            />
            </TouchableOpacity>
            <TouchableOpacity>

            <ActionButton
              icon={<MaterialCommunityIcons name="video-outline" size={26} color="#16a34a" />}
              label="Video"
            />
            </TouchableOpacity>
            <TouchableOpacity>

            <ActionButton
              icon={<FontAwesome name="rupee" size={22} color="#16a34a" />}
              label="Pay"
            />
            </TouchableOpacity>
            <TouchableOpacity>

            <ActionButton
              icon={<Ionicons name="search" size={25} color="#16a34a" />}
              label="Search"
            />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Group 1 */}
        <View className="bg-white mt-4">
          <TouchableOpacity>

          <OptionRow
            icon={<Ionicons name="notifications-outline" size={24} color="black" />}
            title="Notifications"
          />
          </TouchableOpacity>
          <TouchableOpacity>

          <OptionRow
            icon={<MaterialCommunityIcons name="image-outline" size={24} color="black" />}
            title="Media Visibility"
          />
          </TouchableOpacity>
        </View>

        {/* Settings Group 2 */}
        <View className="bg-white mt-4 mb-5">
          <TouchableOpacity>
          <OptionRow
            icon={<MaterialCommunityIcons name="lock-outline" size={24} color="black" />}
            title="Encryption"
            subtitle="Messages and calls are end-to-end encrypted. Tap to verify."
          />
          </TouchableOpacity>
          <TouchableOpacity>
          <OptionRow
            icon={<MaterialCommunityIcons name="progress-clock" size={24} color="black" />}
            title="Disappearing messages"
            subtitle="Off"
          /> 
          </TouchableOpacity>
         <TouchableOpacity>

          <OptionRow
            icon={<MaterialCommunityIcons name="message-text-lock-outline" size={24} color="black" />}
            title="Chat Lock"
            subtitle="Lock and hide this chat on this device."
          />
         </TouchableOpacity>
         <TouchableOpacity>

          <OptionRow
            icon={<MaterialIcons name="privacy-tip" size={24} color="black" />}
            title="Advanced Chat privacy"
          />
         </TouchableOpacity>
        </View>

        {/* Actions Group 3 */}
        <View className="bg-white mt-4 mb-5">
          <TouchableOpacity>
           <OptionRow
            icon={<MaterialCommunityIcons name="heart-outline" size={24} color="black" />}
            title="Add to favourite"
          /></TouchableOpacity>
          <TouchableOpacity>

          <OptionRow
            icon={<MaterialCommunityIcons name="playlist-plus" size={24} color="black" />}
            title="Add to list"
          />
          </TouchableOpacity>
          <TouchableOpacity>

          <OptionRow
            icon={<MaterialCommunityIcons name="block-helper" size={24} color="red" />}
            title={<Text className="text-red-500">Block {profile.username}</Text>}
          />
          </TouchableOpacity>
          <TouchableOpacity>

          <OptionRow
            icon={<MaterialIcons name="report" size={24} color="red" />}
            title={<Text className="text-red-500">Report {profile.username}</Text>}
            showBorder={false}
          />
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
