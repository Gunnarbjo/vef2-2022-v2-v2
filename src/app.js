import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import passport from './lib/login.js';
import { isInvalid } from './lib/template-helpers.js';
import { adminRouter } from './routes/admin-routes.js';
import { indexRouter } from './routes/index-routes.js';

dotenv.config();

const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret = 'asdf',
  DATABASE_URL: connectionString = 'postgres://:@localhost/postgres',
} = process.env;

if (!connectionString || !sessionSecret) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

/*app.use(express.static(join(path, '../public')));
app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');*/

app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    maxAge: 20 * 1000, // 20 sek
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.locals = {
  isInvalid,
};

app.use('/admin', adminRouter);
app.use('/', indexRouter);

/*const data = [
  {
    id: SERIAL(), //random? random er betra en spurning hvort að
    name: bd,
    username: fesfes,
    password: fesfes,
    admin: false,
  },
];*/

/** Middleware sem sér um 404 villur. */
/*app.use((req, res) => {
  const title = 'Síða fannst ekki';
  res.status(404).render('error', { title });
});*/

/** Middleware sem sér um villumeðhöndlun. */
// eslint-disable-next-line no-unused-vars
/*app.use((err, req, res, next) => {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).render('error', { title });
});*/
app.get('/', (req, res) => {
  res.json(data);
});

app.patch('/:id', (req, res) => {
  const { id } = req.params;

  const { username, name } = req.body;

  const item = data.find((i) => i.id == Number.parseInt(id, 10));

  if (item) {
    return res.json(item);
  }

  if (!item) {
    return res.status(404).json({ error: 'Fannst ekki' });
  }

  const errors = [];

  if (!isEmpty(name)) {
    if (typeof name != 'string' || name.length == 0) {
      errors.push({
        field: 'nafn',
        error: 'Nafn má ekki vera autt',
      });
    }
  }
  if (!isEmpty(username)) {
    if (typeof username != 'string' || username.length == 0) {
      errors.push({
        field: 'Notendanafn',
        error: 'Notendanafn má ekki vera autt',
      });
    }
  }
  if (!isEmpty(password)) {
    if (typeof password != 'string' || password.length == 0) {
      errors.push({
        field: 'password',
        error: 'Password má ekki vera autt',
      });
    }
  }

  //const item = { id: nextID(), nafn };
  //data.push(item);

  return res.status(201).json(item);
});

app.delete('/:id', (req, res) => {
  const { id } = req.params;

  const item = data.find((i) => i.id == Number.parseInt(id, 10));

  if (item) {
    data.splice(data.indexOf(item), 1);
    return res.status(204).end();
  }
  return res.status(404).json({ error: 'Síða fannst ekki' });
});

// Skipta út render fyrir json föll
app.use((req, res) => {
  console.warn('Síða fannst ekki', req.originalUrl);
  res.status(404).json({ error: 'Síða fannst ekki' });
});

app.use((err, req, res, next) => {
  console.log('err :>> ', err);
  if (err instanceof SyntaxError && err.status == 400 && 'body' in err) {
    return res.status(400).json({ error: 'Vitlaust json' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Villa kom upp' });
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
