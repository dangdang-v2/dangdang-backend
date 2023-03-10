const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/auth-middleware');
const userController = require('../controller/user');
const passport = require('passport');

// 회원가입
router.post('/users/signup', userController.userSignup);

// 로그인
router.post('/users/login', userController.login);

// 닉네임 변경
router.patch('/users/modifyNic', authMiddleWare, userController.modifyNicname);

// 비밀번호 변경
router.patch('/users/modifyPW', authMiddleWare, userController.modifyPassword);

// 회원인증
router.get('/users/auth', authMiddleWare, userController.auth);

// 카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));
router.get('/auth/kakao/callback', userController.kakaoLogin);

module.exports = router;
