'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/app/context/ChatContext';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistance } from 'date-fns';
import { motion } from 'framer-motion';
import { Socket } from 'socket.io-client';

declare global {
  interface Window {
    socket?: Socket;
  }
}

export default function ChatBox() {
  const { selectedChat, messages, sendMessage, fetchMessages, isTyping, sendTypingIndicator } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedChat || !window.socket) return;

    const chatId = selectedChat._id;

    const handleTyping = ({ chatId: typingChatId, userId }: { chatId: string; userId: string }) => {
      if (typingChatId === chatId && userId !== user?._id) {
        if (!isTyping[chatId]?.includes(userId)) {
          isTyping[chatId] = [...(isTyping[chatId] || []), userId];
        }
      }
    };

    const handleStopTyping = ({ chatId: typingChatId, userId }: { chatId: string; userId: string }) => {
      if (typingChatId === chatId && userId !== user?._id) {
        isTyping[chatId] = (isTyping[chatId] || []).filter((id) => id !== userId);
      }
    };

    window.socket?.on('typing', handleTyping);
    window.socket?.on('stopTyping', handleStopTyping);

    return () => {
      window.socket?.off('typing', handleTyping);
      window.socket?.off('stopTyping', handleStopTyping);
    };
  }, [selectedChat, user?._id, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Handle typing indicator
    if (!selectedChat) return;

    sendTypingIndicator(true);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set timeout to stop typing indication after 3 seconds
    const timeout = setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);

    setTypingTimeout(timeout);
  };

  const getChatName = () => {
    if (!selectedChat) return '';
    if (selectedChat.isGroupChat) return selectedChat.chatName;
    return selectedChat.users.find(u => u._id !== user?._id)?.username || 'Chat';
  };

  const getTypingUsers = () => {
    if (!selectedChat || !isTyping[selectedChat._id]) return [];
    return selectedChat.users
      .filter(u => isTyping[selectedChat._id].includes(u._id) && u._id !== user?._id)
      .map(u => u.username);
  };

  const renderMessages = () => {
    if (!selectedChat || messages.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <UserCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground">Send a message to start the conversation</p>
        </div>
      );
    }

    let prevDate = '';

    return messages.map((msg, index) => {
      const isSender = msg.sender._id === user?._id;
      const date = new Date(msg.createdAt);
      const formattedDate = date.toLocaleDateString();
      const showDate = prevDate !== formattedDate;

      if (showDate) {
        prevDate = formattedDate;
      }

      // Determine if message is read
      const isRead = msg.readBy.some((id: string) =>
        selectedChat.users.some(u => u._id === id && u._id !== user?._id)
      );

      return (
        <div key={msg._id}>
          {showDate && (
            <div className="flex justify-center my-4">
              <div className="px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs">
                {formattedDate}
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div className={`flex ${isSender ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] items-end`}>
              {!isSender && (
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={msg.sender.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {msg.sender.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                {!isSender && (
                  <span className="text-xs text-muted-foreground ml-1 mb-1">
                    {msg.sender.username}
                  </span>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isSender
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-accent text-accent-foreground rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                <div className="flex items-center mt-1 space-x-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistance(new Date(msg.createdAt), new Date(), { addSuffix: true })}
                  </span>

                  {isSender && (
                    <span className="text-xs">
                      {isRead ? (
                        <span className="text-blue-500">✓✓</span>
                      ) : (
                        <span className="text-muted-foreground">✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    });
  };

  const typingUsers = getTypingUsers();

  return (
    <div className="flex flex-col h-full">
      {selectedChat ? (
        <>
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{getChatName()}</h2>
              {selectedChat.isGroupChat && (
                <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                  {selectedChat.users.length} members
                </span>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div>
              {renderMessages()}
              <div ref={scrollRef} />

              {typingUsers.length > 0 && (
                <div className="flex items-center ml-4 mt-2">
                  <div className="bg-accent p-2 rounded-xl inline-block">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-b





ChatGPT said:
ounce200"></div>
<div className="w-2 h-2 bg-primary rounded-full animate-bounce400"></div>
</div>
<span className="ml-2 text-xs text-muted-foreground">{typingUsers.join(', ')} is typing...</span>
</div>
</div>
)}
</div>
</ScrollArea>
      <form onSubmit={handleSend} className="bg-background p-4 flex items-center space-x-4">
        <Input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message"
          className="flex-1"
        />
        <Button type="submit" disabled={!newMessage.trim()} className="p-2">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </>
  ) : (
    <div className="h-full flex items-center justify-center text-center">
      <h3 className="text-xl font-semibold">Select a conversation</h3>
    </div>
  )}
</div>

);
}