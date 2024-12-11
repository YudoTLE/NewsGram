import 'dotenv/config';

import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ensureLoggedIn } from 'connect-ensure-login';
import db from '../db.mjs';

passport.use(new LocalStrategy(
    {
        usernameField: 'identifier',
        passwordField: 'password'
    },
    async (identifier, password, cb) => {
        console.log(identifier);
        console.log(password);
        
        try {
            let user;
            if (!user) {
                const userRef = await db.collection('users')
                    .where('email', '==', identifier)
                    .get();
                
                if (!userRef.empty)
                    user = userRef.docs[0].data();
            }
            if (!user) {
                const userRef = await db.collection('users')
                    .where('username', '==', identifier)
                    .get();

                if (!userRef.empty)
                    user = userRef.docs[0].data();
            }
            if (!user)
                return cb(null, false, { message: 'Incorrect email or username.' });

            const match = await bcrypt.compare(password, user.password);
            if (!match)
                return cb(null, false, { message: 'Incorrect password.' });

            return cb(null, user);
        } catch (error) {
            console.log('Error during authentication:', error);
            return cb(error);
        }
    }
));

passport.use(new GoogleStrategy(
    {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: '/oauth2/redirect/google',
        state: true,
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, cb) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email)
                return cb(new Error('Google account does not have an email address associated.'));

            const userRef = await db.collection('users')
                .where('email', '==', email)
                .get();

            let user;
            if (userRef.empty) {
                const newUser = {
                    name: profile.displayName,
                    email,
                    createdAt: new Date()
                };
                const newUserRef = await db.collection('users').add(newUser);
                user = { id: newUserRef.id, ...newUser };
            } else {
                const userDoc = userRef.docs[0];
                user = { id: userDoc.id, ...userDoc.data() };
            }

            return cb(null, user);
        } catch (error) {
            console.log('Error during authentication:', error);
            return cb(error);
        }
    }
));

passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, { id: user.id, name: user.name });
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

router.post('/signup', async (req, res) => {
    try {
        const { name, username, password } = req.body;

        const existingUserRef = await db.collection('users')
            .where('username', '==', username)
            .get();
        
        if (!existingUserRef.empty)
            return res.status(400).send('Username already in use.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            username,
            password: hashedPassword
        };
        const newUserRef = await db.collection('users').add(newUser);
        newUser.id = newUserRef.id;

        req.login(newUser, (error) => {
            if (error)
                return res.status(500).send('Error logging in after sign-up.');
            
            return res.redirect('/');
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error during sign-up.');
    }
});

router.post('/logout', (req, res, next) => {
    req.logout((error) => {
        if (error) {
            console.error('Error during logout:', error);
            return next(error);
        }

        res.redirect('/');
    });
});

export default router;