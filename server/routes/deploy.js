const express = require('express');
const axios = require('axios');
const Log = require('../models/Log');

const router = express.Router();

// Heroku API configuration
const HEROKU_API_KEY = process.env.HEROKU_API_KEY;
const GIT_REPO_URL = 'https://github.com/mrfrank-ofc/SUBZERO-BOT/';

// Function to create a Heroku app
const createHerokuApp = async (appName) => {
  const response = await axios.post(
    'https://api.heroku.com/apps',
    { name: appName, region: 'us', stack: 'container' },
    {
      headers: {
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': `Bearer ${HEROKU_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

// Function to set environment variables
const setHerokuEnvVars = async (appId, sessionId, prefix) => {
  await axios.patch(
    `https://api.heroku.com/apps/${appId}/config-vars`,
    { SESSION_ID: sessionId, PREFIX: prefix },
    {
      headers: {
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': `Bearer ${HEROKU_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// Function to deploy Git repository
const deployGitRepo = async (appId) => {
  await axios.post(
    `https://api.heroku.com/apps/${appId}/builds`,
    { source_blob: { url: GIT_REPO_URL } },
    {
      headers: {
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': `Bearer ${HEROKU_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// Deploy route
router.post('/deploy', async (req, res) => {
  const { sessionId, prefix } = req.body;

  try {
    // Generate a random app name
    const appName = `subzero-${Math.random().toString(36).substring(7)}`;

    // Step 1: Create a Heroku app
    const app = await createHerokuApp(appName);

    // Step 2: Set environment variables
    await setHerokuEnvVars(app.id, sessionId, prefix);

    // Step 3: Deploy Git repository
    await deployGitRepo(app.id);

    // Save log to MongoDB
    const log = new Log({ sessionId, prefix, appName, status: 'success' });
    await log.save();

    // Send success response
    res.json({ success: true, message: 'Deployment successful!', appName, log });
  } catch (error) {
    // Save error log to MongoDB
    const log = new Log({ sessionId, prefix, status: 'failed', error: error.message });
    await log.save();

    // Send error response
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch logs route
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(10);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
