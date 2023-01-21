const express = require('express');
const router = express.Router();
const emailController = require('../controller/email');

// ID 분실 시 메일 전송
router.post('/users/find', emailController.sendEmail);

module.exports = router;
