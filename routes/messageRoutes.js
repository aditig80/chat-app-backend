const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.post('/send', async (req, res) => {
  const { from, to, message } = req.body;
  const newMessage = new Message({ from, to, message });
  await newMessage.save();
  res.send('Message stored');
});

router.get('/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const messages = await Message.find({
    $or: [
      { from: chatId },
      { to: chatId },
    ],
  });
  res.json(messages);
});

module.exports = router;