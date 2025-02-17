const express = require('express');
const axios = require('axios');
const Log = require('../models/Log');

const router = express.Router();

router.post('/deploy', async (req, res) => {
  const { sessionId, prefix } = req.body;

  // Save log to MongoDB
  const log = new Log({ sessionId, prefix });
  await log.save();

  // Deploy to Heroku (example)
  try {
    const response = await axios.post('https://api.heroku.com/apps', {
      name: `subzero-${Math.random().toString(36).substring(7)}`,
      region: 'us',
      stack: 'container',
    }, {
      headers: {
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': `Bearer ${process.env.HEROKU_API_KEY}`,
      },
    });

    res.json({ success: true, log: response.data });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
