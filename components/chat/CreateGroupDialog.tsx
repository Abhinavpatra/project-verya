'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/app/context/AuthContext';
import { useChat } from '@/app/context/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
}

interface CreateGroupDialogProps {
  onClose: () => void;
}

export default function CreateGroupDialog({ onClose }: CreateGroupDialogProps) {
  const { user } = useAuth();
  const { createGroupChat } = useChat();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError('');
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/users?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    setError('');
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedUsers.length < 2) {
      setError('Please select at least 2 users');
      return;
    }

    try {
      setLoading(true);
      await createGroupChat(
        selectedUsers.map(u => u._id),
        groupName
      );
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      setError('Failed to create group chat');
    } finally {
      setLoading(false);
    }
  };

  const addUser = (user: User) => {
    if (selectedUsers.some(u => u._id === user._id)) return;
    setSelectedUsers([...selectedUsers, user]);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="group-name">Group Name</Label>
        <Input
          id="group-name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="search-users">Add Users</Label>
        <Input
          id="search-users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email"
        />
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-1 bg-accent rounded-full px-3 py-1"
            >
              <span className="text-sm">{user.username}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-background"
                onClick={() => removeUser(user._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => addUser(user)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {selectedUsers.some(u => u._id === user._id) && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreateGroup} disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </Button>
      </div>
    </div>
  );
}