const express = require('express');
const router = express.Router();
const {
  accessChat,
  getChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes are protected
router.use(protect);

router.route('/').post(accessChat).get(getChats);
router.route('/group').post(createGroupChat);
router.route('/group/rename').put(renameGroupChat);
router.route('/group/add').put(addToGroup);
router.route('/group/remove').put(removeFromGroup);

module.exports = router;