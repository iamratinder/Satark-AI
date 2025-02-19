const axios = require('axios');
const QueryLog = require('../models/queryLog.model');

class LegalQAServiceClass {
  async getResponse(query, options = {}) {
    try {
      // Call your RAG pipeline API
      const response = await axios.post(process.env.RAG_API_ENDPOINT + '/legal-qa', {
        query,
        filters: options.filters,
        user_id: options.userId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RAG_API_KEY}`
        }
      });
      
      // Process and transform response if needed
      return {
        query,
        answer: response.data.answer,
        sources: response.data.sources || [],
        metadata: response.data.metadata || {},
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('RAG API Error:', error);
      throw new Error('Failed to get response from Legal AI');
    }
  }
  
  async logQuery({ userId, query, result }) {
    try {
      await QueryLog.create({
        userId,
        queryType: 'legal-qa',
        query,
        response: result.answer,
        metadata: {
          sources: result.sources,
          confidence: result.confidence
        }
      });
    } catch (error) {
      console.error('Error logging query:', error);
      // Non-blocking, just log the error
    }
  }
  
  async getUserQueryHistory(userId, limit = 20) {
    return QueryLog.find({ 
      userId, 
      queryType: 'legal-qa' 
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  }
}

exports.LegalQAService = new LegalQAServiceClass();