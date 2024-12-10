import 'dotenv/config';

import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csrf from 'csurf';
import passport from 'passport';
import logger from 'morgan';
import pluralize from 'pluralize';

import indexRouter from './routes/index.mjs';
import authRouter from './routes/auth.mjs';
import apiRouter from './routes/api.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = pluralize;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'keyboard cat',
        resave: false, // Don't save session if unmodified
        saveUninitialized: false, // Don't create session until something is stored
    })
);
app.use(csrf()); // Don't forgot to uncomment this
app.use(passport.authenticate('session'));
app.use((req, res, next) => {
    const msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !!msgs.length;
    req.session.messages = [];
    next();
});
app.use((req, res, next) => { // This one also
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/api', apiRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

export default app;
