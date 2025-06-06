const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  try {
    const { messageHistory } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Suggest 3 short replies to continue the conversation.' },
        { role: 'user', content: messageHistory.join('\n') },
      ],
    });

    const suggestions = response.choices[0].message.content
      .split('\n')
      .filter((line) => line.trim());

    res.json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

module.exports = router;
