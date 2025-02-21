const { LegalQAService } = require('../services/legalQA.service');
const QueryLog = require('../models/queryLog.model');

const validateQueryInput = (query) => {
  if (!query || typeof query !== 'string') {
    return 'Query must be a non-empty string';
  }
  if (query.length < 3) {
    return 'Query must be at least 3 characters long';
  }
  if (query.length > 1000) {
    return 'Query must not exceed 1000 characters';
  }
  return null;
};

exports.processLegalQuery = async (req, res) => {
  try {
    const { query, filters } = req.body;
    
    const validationError = validateQueryInput(query);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    const result = await LegalQAService.getResponse(query, {
      userId: req.user.id,
      filters: filters || {}
    });
    
    const savedQuery = await QueryLog.create({
      userId: req.user.id,
      queryType: 'legal-qa',
      query,
      response: result.answer,
      metadata: {
        sources: result.sources,
        confidence: result.confidence,
        categories: filters?.categories || [],
        sourceTypes: filters?.sources || []
      }
    });
    
    return res.status(200).json({
      _id: savedQuery._id,
      query: savedQuery.query,
      answer: savedQuery.response,
      sources: savedQuery.metadata.sources,
      confidence: savedQuery.metadata.confidence,
      timestamp: savedQuery.createdAt
    });
  } catch (error) {
    console.error('Error in LegalQA processing:', error);
    return res.status(500).json({ 
      error: 'Failed to process your legal question',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getQueryHistory = async (req, res) => {
  try {
    const history = await QueryLog.find({ 
      userId: req.user.id, 
      queryType: 'legal-qa' 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
    
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error retrieving query history:', error);
    return res.status(500).json({ error: 'Failed to retrieve query history' });
  }
};

exports.getQueryDetails = async (req, res) => {
  try {
    const { queryId } = req.params;
    
    const queryDetails = await QueryLog.findOne({
      _id: queryId,
      userId: req.user.id
    }).lean();
    
    if (!queryDetails) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    return res.status(200).json({
      query: queryDetails.query,
      answer: queryDetails.response,
      sources: queryDetails.metadata.sources || [],
      confidence: queryDetails.metadata.confidence,
      timestamp: queryDetails.createdAt,
      filters: {
        categories: queryDetails.metadata.categories || [],
        sources: queryDetails.metadata.sourceTypes || []
      }
    });
  } catch (error) {
    console.error('Error retrieving query details:', error);
    return res.status(500).json({ error: 'Failed to retrieve query details' });
  }
};