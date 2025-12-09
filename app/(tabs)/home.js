import useAuthStore from "@/store/useAuthStore";
import useControllerStore from "@/store/useControllerStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../../context/SocketContext";
import { disconnectSocket } from "../../lib/socket";
import {
  extractChatId,
  formatMessageTime,
  getInitials,
} from "../../utils/chatHelpers";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const getConversationName = (chat) =>
  chat.group_name || chat.username || "Conversation";

const getConversationAvatar = (chat) =>
  chat.group_image || chat.profile_image || null;

function ChatAvatar({ chat }) {
  const avatarUri = getConversationAvatar(chat);
  const initials = getInitials(getConversationName(chat));

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        className="w-12 h-12 rounded-full bg-gray-200"
      />
    );
  }

  return (
    <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
      <Text className="text-green-800 font-semibold">{initials}</Text>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, gotoLogin } = useAuthStore();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Unread", "Favorite", "Group"];
  const onChatSelect = useControllerStore((state) => state.setSelectedChat);
  const { socket, AllConversations, setAllConversations, setConversation } =
    useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit("get-conversations");
    socket.on("conversations", (data) => {
      setAllConversations(data);
    });
    return () => {
      socket.off("conversations");
    };
  }, [socket, setAllConversations]);

  const handleLogout = async () => {
    await disconnectSocket();
    gotoLogin();
  };

  const openContacts = () => {
    router.push({ pathname: "/contacts" });
  };

  const getMessagePreview = useCallback(
    (chat) => {
      const currentUserId = user?.id;
      const messageType = chat.message_type || "text";
      const conversationType = chat.type || "user";
      const sender = chat.sender;
      let messageText = chat.message || "";
      const isGroup = conversationType === "group";
      const userIsSender =
        sender?.id && currentUserId ? sender.id === currentUserId : false;

      if (conversationType === "user" && chat.isTyping) {
        return "Typing...";
      }

      if (isGroup && chat.isTypingUsers) {
        const typingUsers = Object.values(chat.isTypingUsers).filter(
          (u) => u?.id !== currentUserId
        );
        if (typingUsers.length === 1) {
          return `${typingUsers[0].username} is typing...`;
        }
        if (typingUsers.length === 2) {
          return `${typingUsers[0].username} and ${
            typingUsers[1].username
          } are typing...`;
        }
        if (typingUsers.length > 2) {
          const [first, second] = typingUsers;
          return `${first.username}, ${second.username} and others are typing...`;
        }
      }

      if (!messageText) return "";

      const truncate = (text) =>
        text.length > 40 ? `${text.slice(0, 40)}…` : text;

      switch (messageType) {
        case "text":
        case "system": {
          if (isGroup) {
            if (userIsSender) return truncate(`You: ${messageText}`);
            return truncate(`${sender?.username || "Someone"}: ${messageText}`);
          }
          return truncate(messageText);
        }
        case "image":
          return isGroup
            ? userIsSender
              ? "You sent a photo"
              : `${sender?.username || "Someone"} sent a photo`
            : "Sent a photo";
        case "video":
          return isGroup
            ? userIsSender
              ? "You sent a video"
              : `${sender?.username || "Someone"} sent a video`
            : "Sent a video";
        case "audio":
          return isGroup
            ? userIsSender
              ? "You sent an audio clip"
              : `${sender?.username || "Someone"} sent an audio clip`
            : "Sent an audio clip";
        case "poll":
          return isGroup
            ? userIsSender
              ? "You created a poll"
              : `${sender?.username || "Someone"} created a poll`
            : "Sent a poll";
        case "document":
        case "file": {
          const fileName = messageText?.split?.("/")?.pop?.() || "File";
          return isGroup
            ? userIsSender
              ? `You sent ${fileName}`
              : `${sender?.username || "Someone"} sent ${fileName}`
            : `Sent ${fileName}`;
        }
        default:
          return truncate(messageText);
      }
    },
    [user?.id]
  );

  const filteredChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = AllConversations;

    if (term) {
      list = list.filter((chat) =>
        getConversationName(chat).toLowerCase().includes(term)
      );
    }

    switch (activeFilter) {
      case "Unread":
        list = list.filter((chat) => (chat.sentCount || 0) > 0);
        break;
      case "Favorite":
        list = list.filter((chat) => chat.isFavorite);
        break;
      case "Group":
        list = list.filter((chat) => chat.type === "group");
        break;
      default:
        break;
    }

    return list;
  }, [AllConversations, search, activeFilter]);

  const handleOpenChat = (chat) => {
    const chatId = chat?.receiver_id;
    if (!chatId) return;
    onChatSelect({ id: chatId, type: chat?.type });
    router.push({ pathname: "/chat/[chatId]", params: { chatId } });
  };

  const renderChat = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleOpenChat(item)}
      className="flex-row justify-between items-center py-3 border-b border-gray-200"
    >
      <View className="flex-row  items-center space-x-3 flex-1">
        <ChatAvatar chat={item} />

        <View className="flex-1 ml-3">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {getConversationName(item)}
          </Text>
          <Text
            className={`text-sm ${
              item.type === "group" && item.isTypingUsers
                ? "text-green-600"
                : item.isTyping
                  ? "text-green-600"
                  : "text-gray-500"
            }`}
            numberOfLines={1}
          >
            {getMessagePreview(item)}
          </Text>
        </View>
      </View>

      <View className="items-end pl-2">
        <Text className="text-gray-500 text-xs mb-1">
          {formatMessageTime(item?.sendedAt)}
        </Text>

        {item?.sentCount ? (
          <View className="bg-green-600 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-semibold">
              {item.sentCount || 0}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    // if (isInitializing) {
    //   return (
    //     <View className="flex-1 items-center justify-center">
    //       <ActivityIndicator color="#16a34a" />
    //       <Text className="text-gray-500 text-sm mt-2">Loading chats...</Text>
    //     </View>
    //   );
    // }

    if (!filteredChats.length) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500 text-center">
            {search
              ? "No conversation matches your search."
              : activeFilter === "Unread"
                ? "No unread messages."
                : activeFilter === "Favorite"
                  ? "No favorite chats yet."
                  : activeFilter === "Group"
                    ? "No groups found."
                    : "No conversations yet. Start messaging!"}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item, index) =>
          String(extractChatId(item) || `chat-${index}`)
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-3xl font-bold text-green-700 ml-2">Chats</Text>

        <View className="flex-row space-x-5 items-center">
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleLogout}
            className="ml-2 bg-red-50 border border-red-100 px-3 py-1 rounded-full"
          >
            <Text className="text-red-600 text-sm font-semibold">Logout</Text>
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

      {/* SEARCH BAR */}
      <View className="mx-4 mt-3 mb-2">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search-outline" size={20} color="gray" />
          <TextInput
            placeholder="Search chats"
            placeholderTextColor="#888"
            className="ml-2 flex-1 text-gray-700"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* FILTERS */}
      <View className="flex-row items-center px-4 mb-2">
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full mr-2 border h-10 ${
              activeFilter === filter
                ? "bg-green-600 border-green-700"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <Text
              className={
                activeFilter === filter
                  ? "text-white font-semibold"
                  : "text-gray-600"
              }
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CHAT LIST */}
      <View className="flex-1 px-4">{renderContent()}</View>

      {/* FLOATING BUTTONS */}
      <View className="absolute bottom-12 right-5 items-end space-y-3">
        <TouchableOpacity
          onPress={() => openContacts()}
          className="bg-green-600 p-4 rounded-full shadow-lg"
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
