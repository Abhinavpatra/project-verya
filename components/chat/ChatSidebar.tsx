'use client';

import { useEffect, useState } from 'react';
import { useChat } from '@/app/context/ChatContext';
import { useAuth } from '@/app/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Users, 
  LogOut, 
  Plus, 
  Menu, 
  X 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateGroupDialog from './CreateGroupDialog';
import axios from 'axios';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status: string;
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: any;
  unreadCount?: number;
}

export default function ChatSidebar() {
  const { chats, fetchChats, setSelectedChat, selectedChat, accessChat } = useChat();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data } = await axios.get(`http://localhost:5000/api/users?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccessChat = async (userId: string) => {
    await accessChat(userId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getChatName = (chat: Chat) => {
    if (chat.isGroupChat) return chat.chatName;
    return chat.users.find(u => u._id !== user?._id)?.username || 'Chat';
  };

  const getUserStatus = (chat: Chat) => {
    if (chat.isGroupChat) return '';
    const chatUser = chat.users.find(u => u._id !== user?._id);
    return chatUser?.status || 'offline';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getLastMessage = (chat: Chat) => {
    if (!chat.latestMessage) return 'No messages yet';
    return chat.latestMessage.content?.length > 25
      ? chat.latestMessage.content.substring(0, 25) + '...'
      : chat.latestMessage.content;
  };

  const getLastMessageTime = (chat: Chat) => {
    if (!chat.latestMessage) return '';
    const date = new Date(chat.latestMessage.createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className={`md:block fixed md:relative bg-background z-10 h-full transition-all duration-300 ease-in-out ${isOpen ? 'w-full left-0' : 'w-0 md:w-72 -left-full md:left-0'}`}>
        <div className="flex flex-col h-full w-full md:w-72 border-r">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chats</h2>
            <div className="flex items-center space-x-2">
              <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                  </DialogHeader>
                  <CreateGroupDialog onClose={() => setIsCreatingGroup(false)} />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-3 border-b">
            <div className="relative">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-4"
              />
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                onClick={handleSearch}
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-md p-2 bg-background">
                <h3 className="text-sm font-medium mb-2">Search Results</h3>
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleAccessChat(user._id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {chats.map((chat) => (
                <motion.div
                  key={chat._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?._id === chat._id
                      ? 'bg-primary/10'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => {
                    setSelectedChat(chat);
                    setIsOpen(false);
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      {chat.isGroupChat ? (
                        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                          <Users className="h-5 w-5" />
                        </div>
                      ) : (
                        <>
                          <AvatarImage src={chat.users.find(u => u._id !== user?._id)?.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getChatName(chat).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    {!chat.isGroupChat && (
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                          getUserStatus(chat)
                        )}`}
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{getChatName(chat)}</p>
                      <span className="text-xs text-muted-foreground">
                        {getLastMessageTime(chat)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate">
                        {getLastMessage(chat)}
                      </p>
                      {chat.unreadCount ? (
                        <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {chat.unreadCount}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 md:hidden z-10"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
