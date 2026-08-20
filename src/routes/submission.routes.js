const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');

router.post('/', submissionController.submit);

module.exports = router;