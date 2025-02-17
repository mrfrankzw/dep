const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = 'mongodb+srv://darexmucheri:cMd7EoTwGglJGXwR@cluster0.uwf6z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Log schema
const logSchema = new mongoose.Schema({
    repoUrl: String,
    envVars: Object,
    status: String,
    timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model('Log', logSchema);

// Heroku API credentials
const HEROKU_API_KEY = 'HRKU-bf861bfd-8c26-4a08-8398-3d77471dbead';

// Generate random app name
const generateAppName = () => {
    return `subzero-bot-${Math.random().toString(36).substring(7)}`;
};

// Route to deploy Git repo
app.post('/deploy', async (req, res) => {
    const { repoUrl, envVars } = req.body;
    const appName = generateAppName();

    try {
        // Deploy to Heroku
        const response = await axios.post(
            'https://api.heroku.com/apps',
            {
                name: appName,
                source_blob: { url: repoUrl },
                env: envVars,
            },
            {
                headers: {
                    'Accept': 'application/vnd.heroku+json; version=3',
                    'Authorization': `Bearer ${HEROKU_API_KEY}`,
                },
            }
        );

        // Save log to MongoDB
        const log = new Log({
            repoUrl,
            envVars,
            status: 'Deployment started',
        });
        await log.save();

        res.status(200).json({ message: 'Deployment started!', data: response.data });
    } catch (error) {
        res.status(500).json({ error: 'Deployment failed', details: error.message });
    }
});

// Route to fetch logs
app.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
