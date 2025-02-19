// const { LegalQAService } = require('../services/legalQA.service');
// const { validateQueryInput } = require('../utils/validators');
// const QueryLog = require('../models/queryLog.model');

// exports.processLegalQuery = async (req, res) => {
//   try {
//     const { query } = req.body;
    
//     // Validate input
//     const validationError = validateQueryInput(query);
//     if (validationError) {
//       return res.status(400).json({ error: validationError });
//     }
    
//     // Process query through LegalQA service
//     const result = await LegalQAService.getResponse(query, {
//       userId: req.user.id,
//       filters: req.body.filters || {}
//     });
    
//     // Save query to database
//     const savedQuery = await QueryLog.create({
//       userId: req.user.id,
//       queryType: 'legal-qa',
//       query,
//       response: result.answer,
//       metadata: {
//         sources: result.sources,
//         confidence: result.confidence
//       }
//     });
    
//     // Return the saved query ID along with the result
//     return res.status(200).json({
//       ...result,
//       _id: savedQuery._id
//     });
//   } catch (error) {
//     console.error('Error in LegalQA processing:', error);
//     return res.status(500).json({ 
//       error: 'Failed to process your legal question',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.getQueryHistory = async (req, res) => {
//   try {
//     const history = await QueryLog.find({ 
//       userId: req.user.id, 
//       queryType: 'legal-qa' 
//     })
//     .sort({ createdAt: -1 })
//     .limit(20)
//     .lean();
    
//     return res.status(200).json({ history });
//   } catch (error) {
//     console.error('Error retrieving query history:', error);
//     return res.status(500).json({ error: 'Failed to retrieve query history' });
//   }
// };

// exports.getQueryDetails = async (req, res) => {
//   try {
//     const { queryId } = req.params;
    
//     const queryDetails = await QueryLog.findOne({
//       _id: queryId,
//       userId: req.user.id
//     }).lean();
    
//     if (!queryDetails) {
//       return res.status(404).json({ error: 'Query not found' });
//     }
    
//     // Transform the data to match the expected format by the frontend
//     return res.status(200).json({
//       query: queryDetails.query,
//       answer: queryDetails.response,
//       sources: queryDetails.metadata.sources || [],
//       confidence: queryDetails.metadata.confidence,
//       timestamp: queryDetails.createdAt
//     });
//   } catch (error) {
//     console.error('Error retrieving query details:', error);
//     return res.status(500).json({ error: 'Failed to retrieve query details' });
//   }
// };