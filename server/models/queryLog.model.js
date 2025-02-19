const mongoose = require('mongoose');

const queryLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  queryType: {
    type: String,
    required: true,
    enum: ['legal-qa', 'document-gen', 'legal-knowledge']
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indices for query performance
queryLogSchema.index({ userId: 1, queryType: 1, createdAt: -1 });

module.exports = mongoose.model('QueryLog', queryLogSchema);