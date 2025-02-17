const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  sessionId: String,
  prefix: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', LogSchema);
