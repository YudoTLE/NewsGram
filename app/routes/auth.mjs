import 'dotenv/config';

import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ensureLoggedIn } from 'connect-ensure-login';
import db from '../db.mjs';

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
            const usersCollection = db.collection('users');
            const usersQuery = await usersCollection.where('id', '==', profile.id).get();

            let user;
            if (usersQuery.empty) {
                const newUser = {
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value || null
                };
                const newUserRef = await usersCollection.add(newUser);
                user = { id: newUserRef.id, ...newUser };
            } else {
                const userDoc = usersQuery.docs[0];
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

router.post('/logout', (req, res, next) => {
    req.logout((error) => {
        if (error)
            return next(error);
        res.redirect('/');
    });
});

export default router;