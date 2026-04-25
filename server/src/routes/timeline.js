const express = require('express')
const TimelineController = require('../controllers/timelineController')

const router = express.Router()

router.get('/', TimelineController.getTimeline)

module.exports = router
