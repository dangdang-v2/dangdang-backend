import express from 'express';
import connect from './schemas/index';
import cors from 'cors';
const app = express();
import passport from 'passport';
import passportConfig from './passport';
const port = process.env.PORT;
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ms from 'ms';
import userRouter from './routes/user';
import guideRouter from './routes/guide';
import profileRouter from './routes/profile';
import mapRouter from './routes/map';
import emailRouter from './routes/email';
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
  }),
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
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  helmet.hsts({
    maxAge: ms('1 year'),
    includeSubDomains: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
  }),
);

app.use(helmet.xssFilter());

app.use(helmet.frameguard('deny'));

app.use(helmet.noSniff());

app.use('/api', [userRouter, guideRouter, profileRouter, mapRouter, emailRouter]);
