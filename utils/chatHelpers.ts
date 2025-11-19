type AnyRecord = Record<string, any>;

export const extractChatId = (chat?: AnyRecord | null) => {
  if (!chat) return null;
  return chat.chatId || chat._id || chat.id || null;
};

export const getChatTitle = (chat: AnyRecord = {}) => {
  const participants = Array.isArray(chat.participants)
    ? chat.participants
        .map((user: AnyRecord) => user?.username || user?.name)
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    chat.title ||
    chat.name ||
    chat.chatName ||
    chat.displayName ||
    participants ||
    "Conversation"
  );
};

export const getChatAvatar = (chat: AnyRecord = {}) =>
  chat.photo ||
  chat.avatar ||
  chat.image ||
  chat.picture ||
  chat.participants?.[0]?.avatar ||
  chat.participants?.[0]?.photo ||
  null;

export const getLastMessagePreview = (chat: AnyRecord = {}) => {
  const preview =
    chat.lastMessage?.message ||
    chat.lastMessage?.text ||
    chat.lastMessage ||
    chat.messagePreview;

  if (!preview) return "Tap to start chatting";
  return typeof preview === "string" ? preview : String(preview);
};

export const extractMessageText = (message: AnyRecord = {}) => {
  if (!message) return "";
  return (
    message.message ||
    message.text ||
    message.content ||
    (typeof message === "string" ? message : "")
  );
};

export const extractMessageTimestamp = (message: AnyRecord = {}) =>
  message?.createdAt || message?.updatedAt || message?.timestamp || null;

export const formatMessageTime = (value?: string | number | Date | null) => {
  if (!value && value !== 0) return "";

  const date =
    typeof value === "number" ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const getInitials = (value: string) =>
  value ? value.slice(0, 2).toUpperCase() : "??";
