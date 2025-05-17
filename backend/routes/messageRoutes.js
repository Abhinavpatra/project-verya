const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markMessagesAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes are protected
router.use(protect);

router.route('/').post(sendMessage);
router.route('/:chatId').get(getMessages);
router.route('/read/:chatId').put(markMessagesAsRead);

module.exports = router;