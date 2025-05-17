const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

let connectedUsers = new Map();
let typingUsers = new Map();

const setupWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    let userId = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'auth') {
          const token = data.token;
          if (!token) return ws.send(JSON.stringify({ type: 'error', message: 'No token provided' }));

          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
            await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: Date.now() });
            connectedUsers.set(userId, ws);
            ws.send(JSON.stringify({ type: 'auth_success', userId }));
            broadcastUserStatus(userId, 'online');
          } catch {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
          }
        } else if (data.type === 'new_message' && userId) {
          const { message, chatId, recipients } = data;

          recipients.forEach((recipientId) => {
            const recipientWs = connectedUsers.get(recipientId);
            if (recipientWs?.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'new_message',
                message,
                chatId,
              }));
            }
          });
        } else if (data.type === 'typing_indicator' && userId) {
          const { chatId, isTyping, recipients } = data;
          if (!chatId || typeof isTyping !== 'boolean' || !Array.isArray(recipients)) {
            console.warn('Invalid typing payload:', data);
            return;
          }

          if (isTyping) {
            if (!typingUsers.has(chatId)) typingUsers.set(chatId, new Set());
            typingUsers.get(chatId).add(userId);
          } else if (typingUsers.has(chatId)) {
            typingUsers.get(chatId).delete(userId);
            if (typingUsers.get(chatId).size === 0) typingUsers.delete(chatId);
          }

          recipients.forEach((recipientId) => {
            const recipientWs = connectedUsers.get(recipientId);
            if (recipientWs?.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'typing_indicator',
                chatId,
                userId,
                isTyping,
              }));
            }
          });
        } else if (data.type === 'read_receipt' && userId) {
          const { chatId, messageId, sender } = data;
          const senderWs = connectedUsers.get(sender);
          if (senderWs?.readyState === WebSocket.OPEN) {
            senderWs.send(JSON.stringify({
              type: 'message_read',
              chatId,
              messageId,
              readBy: userId,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (!userId) return;
      await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: Date.now() });
      connectedUsers.delete(userId);
      for (const [chatId, set] of typingUsers.entries()) {
        if (set.has(userId)) {
          set.delete(userId);
          if (set.size === 0) typingUsers.delete(chatId);
        }
      }
      broadcastUserStatus(userId, 'offline');
    });
  });

  const broadcastUserStatus = (userId, status) => {
    for (const [id, sock] of connectedUsers.entries()) {
      if (id !== userId && sock.readyState === WebSocket.OPEN) {
        sock.send(JSON.stringify({ type: 'user_status', userId, status }));
      }
    }
  };

  return wss;
};

module.exports = setupWebSocketServer;