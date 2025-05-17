"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  chatId: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  groupAdmin?: User;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

interface ChatContextType {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  loading: boolean;
  typing: boolean;
  isTyping: Record<string, string[]>;
  fetchChats: () => Promise<void>;
  setSelectedChat: (chat: Chat | null) => void;
  sendMessage: (content: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  createGroupChat: (users: string[], name: string) => Promise<void>;
  accessChat: (userId: string) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState<Record<string, string[]>>({});
  const { socket, isConnected, sendSocketMessage } = useWebSocket();

  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/chats", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const chatsWithUnreadCount = data.map((chat: Chat) => {
        let unreadCount = 0;
        if (chat.latestMessage) {
          const isRead = chat.latestMessage.readBy.includes(user._id);
          const isSender = chat.latestMessage.sender._id === user._id;
          if (!isRead && !isSender) {
            unreadCount = 1;
          }
        }
        return {
          ...chat,
          unreadCount,
        };
      });

      setChats(chatsWithUnreadCount);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(
    async (chatId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:5000/api/messages/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setMessages(data);

        await axios.put(
          `http://localhost:5000/api/messages/read/${chatId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === chatId ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_message") {
        const newMessage: Message = data.message;

        if (selectedChat && selectedChat._id === data.chatId) {
          setMessages((prevMessages) => {
            // Avoid duplicating messages
            if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
              return [...prevMessages, newMessage];
            }
            return prevMessages;
          });

          sendSocketMessage({
            type: "read_receipt",
            chatId: data.chatId,
            messageId: newMessage._id,
            sender: user?._id,
          });
        } else {
          // Increment unread count for non-selected chat
          setChats((prevChats) =>
            prevChats.map((c) =>
              c._id === data.chatId && newMessage.sender._id !== user?._id
                ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
                : c
            )
          );
        }

        // Update latest message in chats
        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === data.chatId
              ? { ...c, latestMessage: newMessage }
              : c
          )
        );
      } else if (data.type === "typing_indicator") {
        const { chatId, userId, isTyping: userIsTyping } = data;

        setIsTyping((prev) => {
          const chatTypers = prev[chatId] || [];
          if (userIsTyping) {
            if (!chatTypers.includes(userId)) {
              return {
                ...prev,
                [chatId]: [...chatTypers, userId],
              };
            }
          } else {
            return {
              ...prev,
              [chatId]: chatTypers.filter((id) => id !== userId),
            };
          }
          return prev;
        });
      } else if (data.type === "message_read") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, readBy: [...msg.readBy, data.readBy] }
              : msg
          )
        );
      } else if (data.type === "user_status") {
        setChats((prevChats) =>
          prevChats.map((chat) => ({
            ...chat,
            users: chat.users.map((u) =>
              u._id === data.userId ? { ...u, status: data.status } : u
            ),
          }))
        );
      }
    };

    socket.addEventListener("message", handleNewMessage);

    return () => {
      socket.removeEventListener("message", handleNewMessage);
    };
  }, [socket, isConnected, selectedChat, sendSocketMessage, user]);

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!selectedChat || !user) return;

    setTyping(isTyping);

    const recipients = selectedChat.users
      .filter((u) => u._id !== user._id)
      .map((u) => u._id);

    sendSocketMessage({
      type: "typing_indicator",
      chatId: selectedChat._id,
      isTyping,
      recipients,
    });
  };

  const sendMessage = async (content: string) => {
    if (!selectedChat || !user || !content.trim()) return;

    try {
      sendTypingIndicator(false);

      const { data } = await axios.post(
        "http://localhost:5000/api/messages",
        {
          content,
          chatId: selectedChat._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setMessages((prev) => [...prev, data]);

      const recipients = selectedChat.users
        .filter((u) => u._id !== user._id)
        .map((u) => u._id);

      sendSocketMessage({
        type: "new_message",
        message: data,
        chatId: selectedChat._id,
        recipients,
      });

      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === selectedChat._id
            ? { ...c, latestMessage: data }
            : c
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const accessChat = async (userId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:5000/api/chats",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      await fetchMessages(data._id);
    } catch (error) {
      console.error("Error accessing chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const createGroupChat = async (users: string[], name: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:5000/api/chats/group",
        {
          name,
          users: JSON.stringify(users),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setChats([data, ...chats]);
      setSelectedChat(data);
    } catch (error) {
      console.error("Error creating group chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChat,
        messages,
        loading,
        typing,
        isTyping,
        fetchChats,
        setSelectedChat,
        sendMessage,
        fetchMessages,
        createGroupChat,
        accessChat,
        sendTypingIndicator,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};