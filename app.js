const fs = require('fs');
const https = require('https');
const express = require('express');
const connect = require('./schemas/index');
const cors = require('cors');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./passport');
const port = process.env.PORT;
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const ms = require('ms');
const userRouter = require('./routes/user');
const guideRouter = require('./routes/guide');
const profileRouter = require('./routes/profile');
const mapRouter = require('./routes/map');
const emailRouter = require('./routes/email');
require('dotenv').config();

const options = {
  ca: fs.readFileSync('/etc/letsencrypt/live/dengroundserver.com/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/dengroundserver.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/dengroundserver.com/cert.pem'),
};

https.createServer(options, app).listen(443, () => {
  console.log(port, '포트로 서버가 켜졌습니다.');
});

connect();
passportConfig();

app.use((req, res, next) => {
  console.log('Request URL:', `[${req.method}]`, req.originalUrl, ' - ', new Date().toLocaleString());
  next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.disable('x-powered-by');

app.use(
  cors({
    origin: 'https://denground.com',
    credentials: true,
  })
);

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  helmet.hsts({
    maxAge: ms('1 year'),
    includeSubDomains: true,
  })
);

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
  })
);

app.use(helmet.xssFilter());

app.use(helmet.frameguard('deny'));

app.use(helmet.noSniff());

app.use('/api', [userRouter, guideRouter, profileRouter, mapRouter, emailRouter]);
