const express = require('express')
const AuthController = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)
router.get('/me', authenticate, AuthController.me)

module.exports = router
