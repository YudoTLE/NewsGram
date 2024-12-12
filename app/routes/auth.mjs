import 'dotenv/config';

import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { localStrategy, googleStrategy, signup, logout } from '../controllers/auth.mjs';

passport.use(new LocalStrategy(
    {
        usernameField: 'identifier',
        passwordField: 'password'
    },
    localStrategy
));

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/oauth2/redirect/google',
        state: true,
        scope: ['profile', 'email']
    },
    googleStrategy
));

passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, {
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo
        });
    });
});

passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, user);
    });
});

const router = express.Router();

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/'
}));

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
}));

router.post('/signup', signup);

router.post('/logout', logout);

export default router;