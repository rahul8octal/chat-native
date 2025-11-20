export const extractChatId = (chat) => {
  if (!chat) return null;
  return chat.chatId || chat._id || chat.id || null;
};

export const getChatTitle = (chat = {}) => {
  const participants = Array.isArray(chat.participants)
    ? chat.participants
        .map((user) => user?.username || user?.name)
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

export const getChatAvatar = (chat = {}) =>
  chat.photo ||
  chat.avatar ||
  chat.image ||
  chat.picture ||
  chat.participants?.[0]?.avatar ||
  chat.participants?.[0]?.photo ||
  null;

export const getLastMessagePreview = (chat = {}) => {
  const preview =
    chat.lastMessage?.message ||
    chat.lastMessage?.text ||
    chat.lastMessage ||
    chat.messagePreview;

  if (!preview) return "Tap to start chatting";
  return typeof preview === "string" ? preview : String(preview);
};

export const extractMessageText = (message = {}) => {
  if (!message) return "";
  return (
    message.message ||
    message.text ||
    message.content ||
    (typeof message === "string" ? message : "")
  );
};

export const extractMessageTimestamp = (message = {}) =>
  message?.createdAt || message?.updatedAt || message?.timestamp || null;

export const formatMessageTime = (value) => {
  if (!value && value !== 0) return "";

  const date =
    typeof value === "number" ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const getInitials = (value = "") =>
  value ? value.slice(0, 2).toUpperCase() : "??";
