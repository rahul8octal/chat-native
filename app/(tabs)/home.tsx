import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { disconnectSocket } from "../../lib/socket";
import { useSocket } from "../../context/SocketContext";
import { extractChatId, formatMessageTime, getInitials } from "../../utils/chatHelpers";

type Conversation = Record<string, any>;
type FilterOption = "All" | "Unread" | "Favorite" | "Group";

const getConversationName = (chat: Conversation = {}) =>
  chat.title ||
  chat.group_name ||
  chat.username ||
  chat.name ||
  chat.chatName ||
  "Conversation";

const getConversationAvatar = (chat: Conversation = {}) =>
  chat.group_image || chat.profile_image || chat.photo || chat.avatar || null;

type ChatAvatarProps = {
  chat: Conversation;
};

function ChatAvatar({ chat }: ChatAvatarProps) {
  const avatarUri = getConversationAvatar(chat);
  const initials = getInitials(getConversationName(chat));

  if (avatarUri) {
    return <Image source={{ uri: avatarUri }} className="w-12 h-12 rounded-full bg-gray-200" />;
  }

  return (
    <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
      <Text className="text-green-800 font-semibold">{initials}</Text>
    </View>
  );
}

type HomeSocketContext = {
  socket: any;
  profile?: Conversation | null;
  conversations?: Conversation[];
  allConversations?: Conversation[];
  setAllConversations?: React.Dispatch<React.SetStateAction<Conversation[]>>;
  selectChat?: (chat: Conversation) => void;
  isConnected?: boolean;
  isInitializing?: boolean;
  resetContextState?: () => void;
};

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const filters: FilterOption[] = ["All", "Unread", "Favorite", "Group"];

  const socketContext = useSocket() as unknown as HomeSocketContext;
  const socket = socketContext.socket;
  const profile = socketContext.profile ?? null;
  const conversations = socketContext.conversations ?? [];
  const allConversations = socketContext.allConversations ?? [];
  const noopDispatch: React.Dispatch<React.SetStateAction<Conversation[]>> = () => undefined;
  const setAllConversations =
    socketContext.setAllConversations ?? noopDispatch;
  const selectChat: (chat: Conversation) => void = socketContext.selectChat ?? (() => {});
  const isConnected = socketContext.isConnected ?? false;
  const isInitializing = socketContext.isInitializing ?? false;
  const resetContextState: () => void = socketContext.resetContextState ?? (() => {});

  const currentUserId = profile?.id || profile?._id || profile?.userId;

  useEffect(() => {
    if (!socket) return;
    socket.emit("get-conversations");
    socket.on("conversations", (data: Conversation[]) => {
      setAllConversations(data);
    });
    return () => {
      socket.off("conversations");
    };
  }, [socket, setAllConversations]);

  const handleLogout = async () => {
    resetContextState();
    await disconnectSocket();
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  const getMessagePreview = useCallback(
    (chat: Conversation = {}) => {
      const messageType = chat.message_type || chat.lastMessageType || "text";
      const conversationType = chat.type || chat.chatType || "user";
      const sender = (chat.sender || {}) as Conversation;
      let messageText = chat.message || chat.lastMessage || "";
      const isGroup = conversationType === "group";
      const userIsSender = sender?.id && currentUserId ? sender.id === currentUserId : false;

      if (conversationType === "user" && chat.isTyping) {
        return "Typing...";
      }

      if (isGroup && chat.isTypingUsers) {
        const typingUsers = (Object.values(chat.isTypingUsers || {}) as Conversation[]).filter(
          (u) => u?.id !== currentUserId
        );
        if (typingUsers.length === 1) {
          return `${typingUsers[0].username || typingUsers[0].name} is typing...`;
        }
        if (typingUsers.length === 2) {
          return `${typingUsers[0].username || typingUsers[0].name} and ${
            typingUsers[1].username || typingUsers[1].name
          } are typing...`;
        }
        if (typingUsers.length > 2) {
          const [first, second] = typingUsers;
          return `${first.username || first.name}, ${second.username || second.name} and others are typing...`;
        }
      }

      if (!messageText) return "";

      const truncate = (text: string) => (text.length > 40 ? `${text.slice(0, 40)}…` : text);

      switch (messageType) {
        case "text":
        case "system": {
          if (isGroup) {
            if (userIsSender) return truncate(`You: ${messageText}`);
            return truncate(`${sender?.username || sender?.name || "Someone"}: ${messageText}`);
          }
          return truncate(messageText);
        }
        case "image":
          return isGroup
            ? userIsSender
              ? "You sent a photo"
              : `${sender?.username || sender?.name || "Someone"} sent a photo`
            : "Sent a photo";
        case "video":
          return isGroup
            ? userIsSender
              ? "You sent a video"
              : `${sender?.username || sender?.name || "Someone"} sent a video`
            : "Sent a video";
        case "audio":
          return isGroup
            ? userIsSender
              ? "You sent an audio clip"
              : `${sender?.username || sender?.name || "Someone"} sent an audio clip`
            : "Sent an audio clip";
        case "poll":
          return isGroup
            ? userIsSender
              ? "You created a poll"
              : `${sender?.username || sender?.name || "Someone"} created a poll`
            : "Sent a poll";
        case "document":
        case "file": {
          const fileName = messageText?.split?.("/")?.pop?.() || "File";
          return isGroup
            ? userIsSender
              ? `You sent ${fileName}`
              : `${sender?.username || sender?.name || "Someone"} sent ${fileName}`
            : `Sent ${fileName}`;
        }
        default:
          return truncate(messageText);
      }
    },
    [currentUserId]
  );

  const filteredChats = useMemo<Conversation[]>(() => {
    const term = search.trim().toLowerCase();
    let list = allConversations.length ? allConversations : conversations;

    if (term) {
      list = list.filter((chat) => getConversationName(chat).toLowerCase().includes(term));
    }

    switch (activeFilter) {
      case "Unread":
        list = list.filter((chat) => (chat.sentCount || chat.unreadCount || 0) > 0);
        break;
      case "Favorite":
        list = list.filter((chat) => chat.isFavorite);
        break;
      case "Group":
        list = list.filter((chat) => (chat.type || chat.chatType) === "group");
        break;
      default:
        break;
    }

    return list;
  }, [allConversations, conversations, search, activeFilter]);

  const handleOpenChat = (chat: Conversation) => {
    const chatId = extractChatId(chat) || chat?.receiver_id || chat?.id;
    if (!chatId) return;
    selectChat({ ...chat, chatId });
    router.push({ pathname: "/chat/[chatId]", params: { chatId } });
  };

  const renderChat: ListRenderItem<Conversation> = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleOpenChat(item)}
      className="flex-row justify-between items-center py-3 border-b border-gray-200"
    >
      <View className="flex-row items-center space-x-3 flex-1">
        <ChatAvatar chat={item} />

        <View className="flex-1">
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
          {formatMessageTime(
            item?.sendedAt ||
              item?.time ||
              item?.lastMessage?.createdAt ||
              item?.updatedAt ||
              item?.createdAt
          )}
        </Text>

        {item?.sentCount || item?.unreadCount ? (
          <View className="bg-green-600 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-semibold">
              {item.sentCount || item.unreadCount || 0}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isInitializing) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#16a34a" />
          <Text className="text-gray-500 text-sm mt-2">Loading chats...</Text>
        </View>
      );
    }

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
      <FlatList<Conversation>
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item, index) => String(extractChatId(item) || `chat-${index}`)}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 mt-2">
        <Text className="text-3xl font-bold text-green-700">Chats</Text>

        <View className="flex-row space-x-5 items-center">
          <Ionicons name="camera-outline" size={23} color="black" />
          <Ionicons name="ellipsis-vertical" size={23} color="black" />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleLogout}
            className="ml-2 bg-red-50 border border-red-100 px-3 py-1 rounded-full"
          >
            <Text className="text-red-600 text-sm font-semibold">Logout</Text>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-2"
        contentContainerStyle={{ paddingVertical: 4 }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full mr-2 border ${
              activeFilter === filter
                ? "bg-green-600 border-green-700"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <Text
              className={
                activeFilter === filter ? "text-white font-semibold" : "text-gray-600"
              }
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      

      {/* CONNECTION BANNER */}
      {!isInitializing && !isConnected ? (
        <View className="mx-4 mb-2 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 flex-row items-center space-x-2">
          <ActivityIndicator size="small" color="#d97706" />
          <Text className="text-yellow-700 text-xs flex-1">
            Reconnecting to the chat server...
          </Text>
        </View>
      ) : null}

      {/* CHAT LIST */}
      <View className="flex-1 px-4">{renderContent()}</View>

      {/* FLOATING BUTTONS */}
      <View className="absolute bottom-12 right-5 items-end space-y-3">
        <TouchableOpacity className="bg-green-600 p-4 rounded-full shadow-lg">
          <Ionicons name="chatbubbles-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
