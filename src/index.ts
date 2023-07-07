import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import morgan from 'morgan';
import db from './config/db';
import router from './config/routes/index.routes';

db.openConn();

const app = express();

app.use(helmet());
app.use(
  session({
    secret: 'withoutsecret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('tiny'));

app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(
    '\x1b[41m\x1b[37m',
    `SERVIDOR FUNCIONANDO NA PORTA ${port}`,
    '\x1b[0m'
  )
);
