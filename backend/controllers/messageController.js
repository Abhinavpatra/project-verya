const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: 'Please provide content and chatId' });
  }

  try {
    // Create a new message
    let message = await Message.create({
      sender: req.user._id,
      content,
      chatId,
      readBy: [req.user._id], // Mark as read by sender
    });

    // Populate message with sender info and chat info
    message = await message.populate('sender', 'username avatar');
    message = await message.populate('chatId');
    message = await User.populate(message, {
      path: 'chatId.users',
      select: 'username avatar email status',
    });

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'username avatar email status')
      .populate('readBy', 'username');

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:chatId
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Find all unread messages in the chat that are not sent by the current user
    const messages = await Message.updateMany(
      {
        chatId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );
    
    res.json({ success: true, count: messages.nModified });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesAsRead,
};