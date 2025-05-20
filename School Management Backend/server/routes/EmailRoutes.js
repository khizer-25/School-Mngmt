const express = require('express');
const {
    sendSingleEmail,
    sendGroupEmail,
    sendDefaulterEmail,
    sendAbsentEmail,
    getEmailHistory
  } = require('../controllers/emailController');
  
  const router = express.Router();
  
  // all handlers are functions imported from your controller
  router.post('/sendSingleEmail', sendSingleEmail);
  router.post('/send-group', sendGroupEmail);
  router.post('/send-defaulters', sendDefaulterEmail);
  router.post('/send-absentees', sendAbsentEmail);
  router.get('/history', getEmailHistory);
  
  module.exports = router;