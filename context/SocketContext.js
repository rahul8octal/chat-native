import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-native";
import socket from "@/lib/socket";
import useAuthStore from "@/store/useAuthStore";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [AllConversations, setAllConversations] = useState([]);
  const [AllGroup, setAllGroup] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const { user } = useAuthStore();
  const [statuses, setStatuses] = useState([]);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const typingTimeouts = useRef({
    user: {},
    group: {},
  });

  useEffect(() => {
    setAllGroup(AllConversations.filter((conversation) => conversation.type === "group"));
  }, [AllConversations]);

  const updateAllConversations = useCallback(
    (data) => {
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
    (data) => {
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
    (data) => {
      if (
        !(
          profile &&
          (profile.id === data.sender_id || profile.id === data.receiver_id) &&
          data.tab_type === profile.type
        ) &&
        !(user?.id === data.sender_id)
      ) {
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
      setConversation(data.conversation);
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
            prev.map((chat) => {
              const status = typeof chat.readStatus === "string" ? chat.readStatus : "";
              if (!["read", "delivered"].includes(status) && chat.sender_id === user?.id) {
                return { ...chat, readStatus: "delivered" };
              }
              return chat;
            })
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
              Array.isArray(s.viewers) && s.viewers.some((v) => v.id === data.viewer.id);

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
    updateAllConversations,
    maybeAppendChat,
    handleToastAndDelivery,
  ]);

  const handleTyping = useCallback(
    (data) => {
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
