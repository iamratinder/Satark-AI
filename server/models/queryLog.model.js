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
    sources: [{
      title: String,
      citation: String,
      excerpt: String,
      url: String,
      relevance: Number
    }],
    confidence: Number,
    categories: [String],
    sourceTypes: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

queryLogSchema.index({ userId: 1, queryType: 1, createdAt: -1 });

const QueryLog = mongoose.model('QueryLog', queryLogSchema);
module.exports = QueryLog;
