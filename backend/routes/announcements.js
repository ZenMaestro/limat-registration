/**
 * Announcements Routes
 */
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all announcements
router.get('/', announcementController.getAnnouncements);

// Admin: Create announcement
router.post('/', authenticate, authorize(['admin']), announcementController.createAnnouncement);

// Admin: Update announcement
router.put('/:id', authenticate, authorize(['admin']), announcementController.updateAnnouncement);

// Admin: Delete announcement
router.delete('/:id', authenticate, authorize(['admin']), announcementController.deleteAnnouncement);

// Increment view count
router.put('/:id/view', announcementController.incrementViewCount);

module.exports = router;
