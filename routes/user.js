const express = require('express')
const router = express.Router()

const authController = require('../controllers/user')

// /api/auth
//Authentification non requise
router.post('/signup',authController.addUser)
router.post('/login',authController.logUser)

module.exports = router