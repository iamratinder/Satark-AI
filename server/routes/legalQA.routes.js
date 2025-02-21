const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  processLegalQuery,
  getQueryHistory,
  getQueryDetails
} = require('../controllers/legalQA.controller');

router.use(authenticate);

router.post('/query', processLegalQuery);
router.get('/history', getQueryHistory);
router.get('/query/:queryId', getQueryDetails);

module.exports = router;