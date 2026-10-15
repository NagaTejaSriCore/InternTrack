const express = require('express');
const router = express.Router();
const {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// All application routes require authentication
router.use(protect);

// Specific sub-paths must come before parameterized /:id routes
router.get('/stats', getApplicationStats);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
