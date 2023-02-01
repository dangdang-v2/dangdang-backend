const kakao = require('./kakaoStrategy');
const passport = require('passport');
const User = require('../schemas/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, { id: user.userID, accessToken: user.accessToken });
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
      .then((user) => {
        done(null, user);
      })
      .catch((err) => done(err));
  });

  kakao(passport);
};
