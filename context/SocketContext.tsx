import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import socket, { type ServerToClientEvents, type ClientToServerEvents } from "@/lib/socket";
import { Socket } from "socket.io-client";
import type {
  IChatConversation,
  IContact,
  IConversation,
  IMessage,
  IProfile,
  IReceiveTyping,
  IStatuses,
} from "@/Types/socket";
import useAuthStore from "@/store/useAuthStore";
import useControllerStore from "@/store/useControllerStore";
import useMobileMenuStore from "@/store/useMobileMenuStore";

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  profile: IProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<IProfile | null>>;
  conversation: IConversation | null;
  setConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
  chats: IMessage[];
  setChats: React.Dispatch<React.SetStateAction<IMessage[]>>;
  statuses: IStatuses[];
  setStatuses: React.Dispatch<React.SetStateAction<IStatuses[]>>;
  contacts: IContact[];
  AllConversations: IChatConversation[];
  setAllConversations: React.Dispatch<React.SetStateAction<IChatConversation[]>>;
  AllGroup: IChatConversation[];
  selectedProfileDetail: IProfile | null;
  setSelectedProfileDetail: React.Dispatch<React.SetStateAction<IProfile | null>>;
  selectedProfileId: {
    id: string;
    type: "user" | "group";
  } | null;
  setSelectedProfileId: React.Dispatch<
    React.SetStateAction<{
      id: string;
      type: "user" | "group";
    } | null>
  >;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setSelectedChat = useControllerStore((state) => state.setSelectedChat);
  const [AllConversations, setAllConversations] = useState<IChatConversation[]>([]);
  const [AllGroup, setAllGroup] = useState<IChatConversation[]>([]);
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [chats, setChats] = useState<IMessage[]>([]);
  const { user } = useAuthStore();
  const [statuses, setStatuses] = useState<IStatuses[]>([]);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<IProfile | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<{
    id: string;
    type: "user" | "group";
  } | null>(null);

  const typingTimeouts = useRef<{
    user: Record<string, NodeJS.Timeout>;
    group: Record<string, Record<string, NodeJS.Timeout>>;
  }>({
    user: {},
    group: {},
  });

  useEffect(() => {
    setAllGroup(AllConversations.filter((conversation) => conversation.type === "group"));
  }, [AllConversations]);

  const updateAllConversations = useCallback(
    (data: IMessage) => {
      setAllConversations((prev) =>
        prev.map((conversation) => {
          if (data.tab_type === "group") {
            if (conversation.receiver_id === data.receiver_id && data.sender_id !== user?.id) {
              return {
                ...conversation,
                sentCount: conversation.sentCount + 1,
                message: data.message,
                message_type: data.type,
                sender: data.sender,
                sendedAt: data.createdAt,
              };
            }
            if (conversation.receiver_id === profile?.id && data.sender_id === user?.id) {
              return {
                ...conversation,
                message: data.message,
                message_type: data.type,
                sender: data.sender,
                sendedAt: data.createdAt,
              };
            }
          } else {
            if (conversation.receiver_id === data.sender_id) {
              return {
                ...conversation,
                sentCount: conversation.sentCount + 1,
                message: data.message,
                message_type: data.type,
                sendedAt: data.createdAt,
              };
            } else if (conversation.receiver_id === data.receiver_id) {
              return {
                ...conversation,
                message: data.message,
                message_type: data.type,
                sendedAt: data.createdAt,
              };
            }
          }
          return conversation;
        })
      );
    },
    [user?.id, profile?.id]
  );

  const maybeAppendChat = useCallback(
    (data: IMessage) => {
      if (
        profile &&
        (profile.id === data.sender_id || profile.id === data.receiver_id) &&
        data.tab_type === profile.type
      ) {
        setChats((prev) => [...prev, data]);
      }
    },
    [profile]
  );

  const handleToastAndDelivery = useCallback(
    (data: IMessage) => {
      if (
        !(
          profile &&
          (profile.id === data.sender_id || profile.id === data.receiver_id) &&
          data.tab_type === profile.type
        ) &&
        !(user?.id === data.sender_id)
      ) {
        // NewMessageToast({
        //   message: data.message,
        //   senderName: data.tab_type === "group" ? data.group_name : data.username || "Unknown User",
        //   image: data.tab_type === "group" ? data.group_image : data.profile_image,
        //   message_type: data.type,
        //   conversation_type: data.tab_type,
        //   sender: data.sender,
        //   moduleId: data.tab_type === "group" ? data.receiver_id : data.sender_id,
        //   isMobile,
        //   setSelectedChat,
        //   setChatMenuIsOpen,
        // });

        setTimeout(() => {
          socket.emit("delivered", {
            chat_Id: data.id || "",
            receiver_id: data.sender_id || "",
            type: data?.tab_type,
          });
        }, 500);
      }
    },
    [profile, user?.id]
  );

  useEffect(() => {
    socket.on("user-conversation", (data) => {
      setProfile(() => {
        const profile = data?.profile;
        if (!profile) return null;

        if (profile.type === "group") {
          profile.is_member = !!profile.members?.some((member) => member.id === user?.id);
        }

        return profile;
      });
      if (!data.conversations_exist) {
        setConversation(null);
        setChats([]);
        return;
      }
      setConversation(data.conversation as IConversation);
      if (data.messages) setChats(data.messages);
      else setChats([]);
    });

    socket.on("delete-messaged", (data) => {
      if (conversation?.id === data.conversation_id) {
        setChats((prev) => prev.filter((message) => message.id !== data.messageId));
      }
    });

    socket.on("update-conversation-count", (data) => {
      setAllConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === data.conversation_id
            ? {
                ...conversation,
                sentCount: data.count,
              }
            : conversation
        )
      );
    });

    socket.on("new-conversation", (data) => {
      // NewMessageToast({
      //   message: data.message,
      //   senderName: data.username || "Unknown User",
      //   image: data.profile_image,
      //   message_type: data.message_type,
      //   conversation_type: data.type,
      //   moduleId: data.receiver_id,
      //   isMobile,
      //   setSelectedChat: setSelectedChat,
      //   setChatMenuIsOpen: setChatMenuIsOpen,
      // });
    });

    socket.on("conversation-deleted", (data) => {
      setAllConversations((prev) =>
        prev.filter((conversation) => conversation.id !== data.conversation_id)
      );

      if (conversation?.id === data.conversation_id) {
        setConversation(null);
        setChats([]);
        setProfile(null);
      }
    });

    socket.on("new-message", (data) => {
      unstable_batchedUpdates(() => {
        updateAllConversations(data);
        maybeAppendChat(data);
      });

      handleToastAndDelivery(data);
    });

    socket.on("poll-updated", (data) => {
      if (profile && profile.id === data.group_id) {
        setChats((prev) =>
          prev.map((chat) => (chat?.poll?.id === data.id ? { ...chat, poll: data } : chat))
        );
      }
    });

    socket.on("seen", (data) => {
      data.forEach((message) => {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === message.id ? { ...chat, readStatus: message?.readStatus } : chat
          )
        );
      });
    });

    socket.on("delivered", (data) => {
      setChats((prev) =>
        prev.map((chat) => (chat.id === data.id ? { ...chat, readStatus: data?.readStatus } : chat))
      );
    });

    socket.on("all-delivered", (data) => {
      if (profile?.id === data.profile_id) {
        if (data.type === "group" && profile?.type === "group") {
          setChats((prev) =>
            prev.map((chat) =>
              Array.isArray(chat.readStatus) &&
              chat.readStatus.some(
                (r) => r._id === data?.user_id && !["delivered", "read"].includes(r.readStatus)
              )
                ? {
                    ...chat,
                    readStatus: chat.readStatus?.map((r) =>
                      data?.user_id === r._id ? { ...r, readStatus: "delivered" } : r
                    ),
                  }
                : chat
            )
          );
        } else if (data.type === "user" && profile?.type === "user") {
          setChats((prev) =>
            prev.map((chat) =>
              !["read", "delivered"].includes(chat.readStatus as string) &&
              chat.sender_id === user?.id
                ? { ...chat, readStatus: "delivered" }
                : chat
            )
          );
        }
      }
    });

    socket.on("contacts", (data) => {
      setContacts(data);
    });
    socket.on("statuses", (data) => {
      setStatuses(data);
    });

    socket.on("status-viewed", (data) => {
      if (data.viewer.user_id === user?.id) return;
      setStatuses((prev) =>
        prev.map((userStatus) => {
          if (userStatus.user.id !== user?.id) return userStatus;

          const updatedStatuses = userStatus.statuses.map((s) => {
            if (s.id !== data.status_id) return s;

            const alreadyViewed =
              Array.isArray(s.viewers) && s.viewers.some((v: any) => v.id === data.viewer.id);

            const newViewers = alreadyViewed ? s.viewers : [...(s.viewers ?? []), data.viewer];
            const newViewsCount = (s.views ?? s.viewers?.length ?? 0) + 1;

            return {
              ...s,
              viewers: newViewers,
              views: newViewsCount,
            };
          });

          return {
            ...userStatus,
            statuses: updatedStatuses,
          };
        })
      );
    });

    socket.on("profile", (data) => {
      if (selectedProfileId?.id === data.id) {
        setSelectedProfileDetail(data);
      }
    });

    return () => {
      socket.off("user-conversation");
      socket.off("delete-messaged");
      socket.off("update-conversation-count");
      socket.off("new-conversation");
      socket.off("new-message");
      socket.off("poll-updated");
      socket.off("seen");
      socket.off("delivered");
      socket.off("all-delivered");
      socket.off("contacts");
      socket.off("statuses");
      socket.off("status-viewed");
      socket.off("profile");
    };
  }, [
    profile,
    user?.id,
    conversation?.id,
    selectedProfileId?.id,
    setSelectedChat,
    updateAllConversations,
    maybeAppendChat,
    handleToastAndDelivery,
  ]);

  const handleTyping = useCallback(
    (data: IReceiveTyping) => {
      const userId = data.user.id;
      const receiverId = data.receiver_id;
      const typing = data.typing ?? true;
      const currentProfileId = profile?.id;
      const currentProfileType = profile?.type;

      // ===== USER CHAT =====
      if (data.tab_type === "user") {
        if (userId === currentProfileId) {
          setProfile((prev) => (prev ? { ...prev, isTyping: typing } : prev));
        }

        setAllConversations((prev) =>
          prev.map((conversation) =>
            conversation.receiver_id === userId && conversation.type === "user"
              ? { ...conversation, isTyping: typing }
              : conversation
          )
        );

        if (typingTimeouts.current.user[receiverId]) {
          clearTimeout(typingTimeouts.current.user[receiverId]);
        }

        typingTimeouts.current.user[receiverId] = setTimeout(() => {
          if (userId === currentProfileId) {
            setProfile((prev) => (prev ? { ...prev, isTyping: false } : prev));
          }

          setAllConversations((prev) =>
            prev.map((conversation) =>
              conversation.receiver_id === userId && conversation.type === "user"
                ? { ...conversation, isTyping: false }
                : conversation
            )
          );

          if (typingTimeouts.current.user[receiverId]) {
            clearTimeout(typingTimeouts.current.user[receiverId]);
            delete typingTimeouts.current.user[receiverId];
          }
        }, 1000);
      }

      if (data.tab_type === "group") {
        if (currentProfileId === receiverId && currentProfileType === "group") {
          setProfile((prev) => {
            if (!prev || prev.type !== "group") return prev;

            const currentTypingUsers = { ...(prev.isTypingUsers || {}) };
            if (typing) {
              currentTypingUsers[userId] = data.user;
            } else {
              delete currentTypingUsers[userId];
            }

            return {
              ...prev,
              isTypingUsers: currentTypingUsers,
            };
          });
        }

        setAllConversations((prev) =>
          prev.map((conversation) => {
            if (conversation.receiver_id === receiverId && conversation.type === "group") {
              const currentTypingUsers = { ...(conversation.isTypingUsers || {}) };
              if (typing) {
                currentTypingUsers[userId] = data.user;
              } else {
                delete currentTypingUsers[userId];
              }

              return {
                ...conversation,
                isTypingUsers: currentTypingUsers,
              };
            }
            return conversation;
          })
        );

        if (!typingTimeouts.current.group[receiverId]) {
          typingTimeouts.current.group[receiverId] = {};
        }

        if (typingTimeouts.current.group[receiverId]?.[userId]) {
          clearTimeout(typingTimeouts.current.group[receiverId][userId]);
          delete typingTimeouts.current.group[receiverId][userId];
        }

        typingTimeouts.current.group[receiverId][userId] = setTimeout(() => {
          if (currentProfileId === receiverId && currentProfileType === "group") {
            setProfile((prev) => {
              if (!prev || prev.type !== "group") return prev;

              const updatedTypingUsers = { ...(prev.isTypingUsers || {}) };
              delete updatedTypingUsers[userId];

              return {
                ...prev,
                isTypingUsers: updatedTypingUsers,
              };
            });
          }

          setAllConversations((prev) =>
            prev.map((conversation) => {
              if (conversation.receiver_id === receiverId && conversation.type === "group") {
                const updatedTypingUsers = { ...(conversation.isTypingUsers || {}) };
                delete updatedTypingUsers[userId];

                return {
                  ...conversation,
                  isTypingUsers: updatedTypingUsers,
                };
              }
              return conversation;
            })
          );

          if (typingTimeouts.current.group[receiverId]?.[userId]) {
            clearTimeout(typingTimeouts.current.group[receiverId][userId]);
            delete typingTimeouts.current.group[receiverId][userId];
          }
        }, 1000);
      }
    },
    [profile?.id, profile?.type]
  );

  useEffect(() => {
    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing");
      Object.values(typingTimeouts.current.user).forEach(clearTimeout);
      Object.values(typingTimeouts.current.group).forEach((groupTimeouts) => {
        Object.values(groupTimeouts).forEach(clearTimeout);
      });
    };
  }, [handleTyping]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        chats,
        setChats,
        statuses,
        setStatuses,
        contacts,
        profile,
        setProfile,
        conversation,
        setConversation,
        AllConversations,
        setAllConversations,
        AllGroup,
        selectedProfileDetail,
        selectedProfileId,
        setSelectedProfileDetail,
        setSelectedProfileId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
