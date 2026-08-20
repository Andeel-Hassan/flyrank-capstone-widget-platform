const express = require('express');
const router = express.Router();
const widgetController = require('../controllers/widget.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.post('/', widgetController.create);
router.get('/', widgetController.list);
router.get('/:id', widgetController.getOne);
router.put('/:id', widgetController.update);
router.delete('/:id', widgetController.remove);

module.exports = router;