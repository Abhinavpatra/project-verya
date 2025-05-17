const Chat = require('../models/chatModel');
const User = require('../models/userModel');

// @desc    Create or access a one-to-one chat
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  try {
    // Find if a one-to-one chat already exists
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    chat = await User.populate(chat, {
      path: 'latestMessage.sender',
      select: 'username avatar email',
    });

    if (chat.length > 0) {
      res.json(chat[0]);
    } else {
      // Create a new chat
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const newChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(newChat._id).populate(
        'users',
        '-password'
      );

      res.status(201).json(fullChat);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    const results = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username avatar email',
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  // Parse users if it's sent as a string
  let userArray = users;
  if (typeof users === 'string') {
    try {
      userArray = JSON.parse(users);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid users format' });
    }
  }

  if (userArray.length < 2) {
    return res
      .status(400)
      .json({ message: 'More than 2 users are required to form a group chat' });
  }

  // Add current user to the group
  userArray.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: userArray,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Rename a group chat
// @route   PUT /api/chats/group/:id
// @access  Private
const renameGroupChat = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(updatedChat);
  } catch (error) {

    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  
  }
};

// @desc    Add a user to a group
// @route   PUT /api/chats/group/add
// @access  Private
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!added) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(added);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove a user from a group
// @route   PUT /api/chats/group/remove
// @access  Private
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!removed) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(removed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  accessChat,
  getChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
};