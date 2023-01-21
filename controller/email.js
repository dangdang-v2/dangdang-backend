const nodemailer = require('nodemailer');
const User = require('../schemas/user');
const CryptoJS = require('crypto-js');
require('dotenv').config();

exports.sendEmail = async (req, res, next) => {
  try {
    const { userID, email } = req.body;
    if (!email)
      return res.status(400).json({
        fail: '이메일을 입력해주세요.',
      });

    const EMAIL = process.env.EMAIL;
    const EMAIL_PASSWORD = process.env.PASSWORD;

    const user = await User.findOne({
      email,
    });

    let receiverEmail = user.email;
    let mailOptions = ``;

    let transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });
    if (!userID) {
      mailOptions = {
        from: EMAIL,
        to: receiverEmail,
        subject: '찾으시는 ID 입니다.',
        text: `회원님의 아이디는 ${user.userID} 입니다.`,
      };
      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return;
        }
      });
      res.status(200).json({
        success: '아이디가 메일로 전송되었습니다.',
      });
    }

    if (userID) {
      if (user.userID !== userID) {
        return res.status(400).json({
          fail: '가입한 아이디 이메일을 입력해주세요.',
        });
      } else {
        function createCode(iLength) {
          let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^*_-';
          let randomStr = '';
          for (let i = 0; i < iLength; i++) {
            randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return randomStr;
        }
        let randomPw = createCode(12);
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(randomPw), process.env.PRIVATE_KEY).toString();
        await User.updateOne({ userID: user.userID }, { $set: { password: encrypted } });
        mailOptions = {
          from: EMAIL,
          to: receiverEmail,
          subject: '찾으시는 PASSWORD 입니다.',
          text: `${user.userID}님의 비밀번호는 ${randomPw} 입니다.
                    임시 비밀번호이니, 로그인 후 비밀번호를 꼭 변경하세요!`,
        };
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
          }
        });
        res.status(200).json({
          success: '임시 비밀번호가 메일로 전송되었습니다.',
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      fail: '다시 입력해주세요.',
    });
  }
};
