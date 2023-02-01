import express from 'express';
import connect from './schemas/index';
import cors from 'cors';
import passport from 'passport';
import passportConfig from './passport';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import userRouter from './routes/user';
import guideRouter from './routes/guide';
import profileRouter from './routes/profile';
import mapRouter from './routes/map';
import emailRouter from './routes/email';
const app = express();
const port = process.env.PORT;
require('dotenv').config();

connect();
passportConfig();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.disable('x-powered-by');

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
  }),
);

app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());

app.use('/api', [userRouter, guideRouter, profileRouter, mapRouter, emailRouter]);

app.listen(port, () => {
  console.log('server open');
});
