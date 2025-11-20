import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocket } from "../../context/SocketContext";
import {
  extractChatId,
  extractMessageText,
  extractMessageTimestamp,
  formatMessageTime,
  getChatTitle,
} from "../../utils/chatHelpers";

export default function ChatDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const socketContext = useSocket();
  const socket = socketContext.socket;
  const conversations = socketContext.conversations ?? [];
  const messages = socketContext.messages ?? [];
  const selectedChat = socketContext.selectedChat ?? null;
  const selectChat = socketContext.selectChat ?? (() => {});
  const leaveChat = socketContext.leaveChat ?? (() => {});
  const sendMessage = socketContext.sendMessage ?? (() => {});
  const emitTyping = socketContext.emitTyping ?? (() => {});
  const typingUsers = socketContext.typingUsers ?? {};
  const loadingMessages = socketContext.loadingMessages ?? false;
  const profile = socketContext.profile ?? null;
  const setProfile = socketContext.setProfile ?? (() => {});
  const setMessages = socketContext.setMessages ?? (() => {});
  const setSelectedChat = socketContext.setSelectedChat ?? (() => {});

  const [text, setText] = useState("");
  const listRef = useRef(null);
  const typingRef = useRef(null);

  const chatIdParam = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;
  const chatId = chatIdParam || extractChatId(selectedChat) || "";

  const meId = profile?.id || profile?._id || profile?.userId;
  const typingUserId = chatId ? typingUsers[chatId] : null;
  const showTyping = Boolean(typingUserId && typingUserId !== meId);

  useEffect(() => {
    if (!selectedChat) {
      setProfile(null);
      setMessages([]);
      setSelectedChat(null);
      return;
    }

    socket.emit("get-conversation", {
      module_id: selectedChat.id,
      type: selectedChat.type,
    });
  }, [socket, selectedChat, setMessages, setProfile, setSelectedChat]);

  useEffect(() => {
    if (!chatId) return;
    const currentSelectedId = extractChatId(selectedChat);
    const existing = conversations.find(
      (conversation) => extractChatId(conversation) === chatId
    );

    if (existing) {
      if (selectedChat !== existing) {
        selectChat(existing);
      }
      return;
    }

    if (currentSelectedId !== chatId) {
      selectChat({ chatId });
    }
  }, [chatId, conversations, selectChat, selectedChat]);

  useEffect(
    () => () => {
      leaveChat();
    },
    [leaveChat]
  );

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
      if (chatId) emitTyping(chatId, false);
    };
  }, [chatId, emitTyping]);

  const title = useMemo(() => getChatTitle(selectedChat || {}), [selectedChat]);

  const handleChangeText = useCallback(
    (value) => {
      setText(value);
      if (!chatId) return;

      if (!value.trim()) {
        emitTyping(chatId, false);
        if (typingRef.current) clearTimeout(typingRef.current);
        return;
      }

      emitTyping(chatId, true);
      if (typingRef.current) clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => emitTyping(chatId, false), 1000);
    },
    [chatId, emitTyping]
  );

  const handleSend = () => {
    if (!chatId || !text.trim()) return;
    sendMessage(chatId, text);
    setText("");
    emitTyping(chatId, false);
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }
  };

  const renderMessage = ({ item }) => {
    const senderId = item?.senderId || item?.userId || item?.from;
    const isMine = senderId && meId ? senderId === meId : item?.isMine;
    const body = extractMessageText(item);
    const timestamp = formatMessageTime(extractMessageTimestamp(item));

    return (
      <View className={`my-1 flex-row ${isMine ? "justify-end" : "justify-start"}`}>
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-100"
        >
          <Ionicons name="chevron-back" size={22} color="#16a34a" />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-xs text-gray-500">
            {showTyping ? "Typing..." : "Say hi 👋"}
          </Text>
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
        <View className="flex-1 px-4 py-3">
          {loadingMessages ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#16a34a" />
              <Text className="text-gray-500 text-sm mt-2">
                Loading messages...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) =>
                String(item?.id || item?._id || index)
              }
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {showTyping ? (
            <View className="mt-2">
              <Text className="text-xs text-gray-500 italic">Typing...</Text>
            </View>
          ) : null}
        </View>

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
