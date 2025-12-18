import useAuthStore from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../../context/SocketContext";
import {
  extractChatId,
  extractMessageText,
  extractMessageTimestamp,
  formatMessageTime,
  getInitials,
} from "../../utils/chatHelpers";


export default function ChatDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const {
    socket,
    chats,
    profile,
    setProfile,
    conversation,
    setConversation,
    AllConversations,
    setSelectedProfileId,
  } = useSocket();
  
  const [text, setText] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const listRef = useRef(null);
  const typingRef = useRef(null);
  const requestedRef = useRef({});
  const prevChatRef = useRef(null);

  const chatIdParam = useMemo(
    () => (Array.isArray(params.chatId) ? params.chatId[0] : params.chatId),
    [params.chatId]
  );
  const resolvedChatId =
    chatIdParam ||
    extractChatId(conversation) ||
    conversation?.receiver_id ||
    "";

  const currentConversation = useMemo(() => {
    if (!resolvedChatId || !conversation) return null;
    const ids = [
      extractChatId(conversation),
      conversation?.receiver_id,
      conversation?.id,
    ]
      .filter(Boolean)
      .map(String);
    return ids.includes(String(resolvedChatId)) ? conversation : null;
  }, [conversation, resolvedChatId]);

  useEffect(() => {
    if (!resolvedChatId || currentConversation || !AllConversations?.length)
      return;
    const match = AllConversations.find((item) => {
      const candidate =
        extractChatId(item) || item.receiver_id || item.id || null;
      return candidate && String(candidate) === String(resolvedChatId);
    });
    if (match) {
      setConversation({
        ...match,
        chatId: extractChatId(match) || resolvedChatId,
      });
    }
  }, [resolvedChatId, currentConversation, AllConversations, setConversation]);

  useEffect(() => {
    if (!resolvedChatId) return;
    if (prevChatRef.current && prevChatRef.current === resolvedChatId) {
      return;
    }
    prevChatRef.current = resolvedChatId;
    setText("");
    setConversation([]);
    setProfile(null);
    setIsRequesting(false);
    if (resolvedChatId in requestedRef.current) {
      delete requestedRef.current[resolvedChatId];
    }
  }, [resolvedChatId, setConversation, setProfile]);

  const conversationType = currentConversation?.type || profile?.type || "user";
  const receiverId =
    profile?.id ||
    currentConversation?.receiver_id ||
    (conversationType === "group" ? resolvedChatId : null);

  // useEffect(() => {
  //   if (!socket || !resolvedChatId || !conversationType) return;
  //   if (requestedRef.current[resolvedChatId]) return;

  //   const target = currentConversation;
  //   const moduleId =
  //     target?.id ||
  //     target?.conversation_id ||
  //     target?.chatId ||
  //     target?.receiver_id ||
  //     resolvedChatId;

  //   if (!moduleId) return;

  //   requestedRef.current[resolvedChatId] = true;
  //   setIsRequesting(true);

  //   socket.emit("get-conversation", {
  //     module_id: moduleId,
  //     type: conversationType,
  //   });
  // }, [socket, resolvedChatId, conversationType, currentConversation]);

  useEffect(() => {
    if (!receiverId) return;
    if (profile?.id === receiverId || profile?._id === receiverId) {
      setIsRequesting(false);
    }
  }, [profile, receiverId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollToEnd({ animated: true });
  }, [conversation]);

  const emitTyping = useCallback(
    (isTyping) => {
      if (!socket || !receiverId) return;
      socket.emit("typing", {
        receiver_id: receiverId,
        tab_type: conversationType,
        typing: isTyping,
      });
    },
    [socket, receiverId, conversationType]
  );

  useEffect(() => {
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
      emitTyping(false);
    };
  }, [emitTyping]);

  useEffect(() => {
    if (chats?.length) {
      setIsRequesting(false);
    }
  }, [chats?.length]);

  const headerSubtitle = useMemo(() => {
    if (!profile) return "Say hi 👋";
    if (profile.type === "group") {
      const typingUsers = Object.values(profile.isTypingUsers || {}).filter(
        (member) => member?.id !== user?.id
      );
      if (!typingUsers?.length) return "Say hi 👋";
      if (typingUsers?.length === 1) {
        const name =
          typingUsers[0].username || typingUsers[0].name || "Someone";
        return `${name} is typing...`;
      }
      if (typingUsers?.length === 2) {
        const [first, second] = typingUsers;
        const firstName = first?.username || first?.name || "Someone";
        const secondName = second?.username || second?.name || "Someone";
        return `${firstName} and ${secondName} are typing...`;
      }
      const first = typingUsers[0];
      return `${
        first?.username || first?.name || "Someone"
      } and others are typing...`;
    }
    return profile.isTyping ? "Typing..." : "Say hi 👋";
  }, [profile, user?.id]);

  const title = useMemo(() => {
    if (profile) {
      return (
        profile.group_name || profile.username || profile.name || "Conversation"
      );
    }
    if (currentConversation) {
      return (
        currentConversation.group_name ||
        currentConversation.username ||
        currentConversation.name ||
        "Conversation"
      );
    }
    return "Conversation";
  }, [profile, currentConversation]);

  const handleChangeText = useCallback(
    (value) => {
      setText(value);
      const trimmed = value.trim();

      if (!trimmed) {
        emitTyping(false);
        if (typingRef.current) {
          clearTimeout(typingRef.current);
          typingRef.current = null;
        }
        return;
      }

      emitTyping(true);
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
      typingRef.current = setTimeout(() => {
        emitTyping(false);
        typingRef.current = null;
      }, 1000);
    },
    [emitTyping]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !socket || !receiverId) return;

    const payload = {
      message: trimmed,
      receiver_id: receiverId,
      tab_type: conversationType,
      type: "text",
    };

    if (currentConversation?.id) {
      payload.conversation_id = currentConversation.id;
    }
    if (currentConversation?.chatId) {
      payload.chatId = currentConversation.chatId;
    }

    socket.emit("send-message", payload);
    setText("");
    emitTyping(false);
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }
  }, [
    text,
    socket,
    receiverId,
    conversationType,
    currentConversation,
    emitTyping,
  ]);

  const renderMessage = ({ item }) => {
    const senderId =
      item?.sender_id ||
      item?.senderId ||
      item?.userId ||
      item?.from ||
      item?.sender?.id;
    const myId = user?.id;
    const isMine = myId ? senderId === myId : item?.isMine;
    const body = extractMessageText(item);
    const timestamp = formatMessageTime(
      extractMessageTimestamp(item) ||
        item?.sendedAt ||
        item?.created_at ||
        null
    );

   

    return (
       
                
      <View
        className={`my-1 flex-row ${isMine ? "justify-end" : "justify-start"}`}
      >
        <View
          className={`max-w-[80%] rounded-2xl px-3 py-2 ${
            isMine ? "bg-green-600" : "bg-gray-100"
          }`}
        >
          <Text className={isMine ? "text-white" : "text-gray-800"}>
            {body || "..."}
          </Text>
          {timestamp ? (
            <Text
              className={`text-[10px] mt-1 text-right ${
                isMine ? "text-green-100" : "text-gray-500"
              }`}
            >
              {timestamp}
            </Text>
          ) : null}
        </View>
      </View>
     
    );
  };

  const shouldShowLoader = isRequesting && !chats?.length;

  const ChatHeaderAvatar = () => {
    const avatar =
      profile?.profile_image ||
      profile?.group_image ||
      currentConversation?.profile_image ||
      currentConversation?.group_image;
    const name = title;
    const initials = getInitials(name);

    if (avatar) {
      return (
        <Image
          source={{ uri: avatar }}
          className="w-10 h-10 rounded-full bg-gray-200"
        />
      );
    }

    return (
      <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
        <Text className="text-green-800 font-semibold text-sm">{initials}</Text>
      </View>
    );
  };

  const EmptyChat = () => (
    <View className="flex-1 items-center justify-center py-10">
      <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-4">
        <Ionicons name="chatbubbles-outline" size={40} color="#16a34a" />
      </View>
      <Text className="text-gray-800 text-lg font-semibold mb-2">
        No messages yet
      </Text>
      <Text className="text-gray-500 text-center px-10">
        Send a message to start the conversation!
      </Text>
    </View>
  );

  const openProfile = () => {
    if (receiverId) {
      setSelectedProfileId({ id: receiverId, type: conversationType });
      router.push({
        pathname: "/profile",
        params: { id: receiverId, type: conversationType },
      });
    }
  };

  const handleback = () => {
    router.push({ pathname: "/home" });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => handleback()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#16a34a" />
        </TouchableOpacity>

        <TouchableOpacity onPress={openProfile}>

        <ChatHeaderAvatar />

        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-xs text-gray-500">{headerSubtitle}</Text>
        </View>
        <TouchableOpacity className="pl-3">
          <Ionicons name="call-outline" size={22} color="#16a34a" />
        </TouchableOpacity>
        <TouchableOpacity className="pl-3">
          <Ionicons name="videocam-outline" size={22} color="#16a34a" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >

        <ImageBackground
                source={{
                  uri: "https://t3.ftcdn.net/jpg/01/99/79/88/360_F_199798806_PAFfWGapie6Mk8igqKHbhIIa9LwQcvQr.jpg",
                }}
                className="flex-1"
                resizeMode="cover"
              >
        <View className="flex-1 px-4 py-3">
          {shouldShowLoader ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#16a34a" />
              <Text className="text-gray-500 text-sm mt-2">
                Loading messages...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={chats}
              renderItem={renderMessage}
              keyExtractor={(item, index) =>
                String(item?.id || item?._id || index)
              }
              contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={EmptyChat}
            />
          )}
        </View>
          </ImageBackground>

        <View className="px-4 pb-5 pt-2 bg-white border-t border-gray-100">
          <View className="flex-row items-center space-x-3 bg-gray-100 rounded-full px-3 py-2">
            <TouchableOpacity>
              <Ionicons name="happy-outline" size={22} color="#6b7280" />
            </TouchableOpacity>

            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Message"
              value={text}
              onChangeText={handleChangeText}
              multiline
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                text.trim() ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
   
    </SafeAreaView>
  );
}
