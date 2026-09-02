const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middleware/authMiddleware');
const terminalController = require('../controllers/terminalController');

// All terminal routes require tenant owner / store admin authentication
router.use(verifyTokenMiddleware);

router.get('/', terminalController.getTerminals);
router.post('/', terminalController.addTerminal);
router.put('/:id', terminalController.updateTerminal);
router.delete('/:id', terminalController.deleteTerminal);

module.exports = router;
