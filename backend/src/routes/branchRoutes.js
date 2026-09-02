const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middleware/authMiddleware');
const branchController = require('../controllers/branchController');

// All branch routes require tenant owner / store admin authentication
router.use(verifyTokenMiddleware);

router.get('/', branchController.getBranches);
router.post('/', branchController.addBranch);
router.put('/:id', branchController.updateBranch);
router.delete('/:id', branchController.deleteBranch);

module.exports = router;
