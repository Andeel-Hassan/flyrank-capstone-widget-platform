const express = require('express');
const router = express.Router();
const publicWidgetController = require('../controllers/publicWidget.controller');

router.get('/:id/config', publicWidgetController.getConfig);

module.exports = router;