import { authenticateLocal, authenticateGoogle, createUser } from '../services/auth.mjs';

export const localStrategy = async (identifier, password, cb) => {
    try {
        const user = await authenticateLocal(identifier, password);
        if (user.error)
            return cb(null, false, { message: user.error });

        return cb(null, user);
    } catch (error) {
        console.log('Error during authentication:', error);
        return cb(error);
    }
};

export const googleStrategy = async (accessToken, refreshToken, profile, cb) => {
    try {
        const user = await authenticateGoogle(profile);
        if (user.error)
            return cb(new Error(user.error));

        console.log(user);

        return cb(null, user);
    } catch (error) {
        console.log('Error during authentication:', error);
        return cb(error);
    }
};

export const signup = async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const newUser = await createUser({ name, username, password });
        if (newUser.error)
            return res.status(400).send(newUser.error);

        req.login(newUser, (error) => {
            if (error)
                return res.status(500).send('Error logging in after sign-up.');
            
            return res.redirect('/');
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error during sign-up.');
    }
};

export const logout = (req, res, next) => {
    req.logout((error) => {
        if (error) {
            console.error('Error during logout:', error);
            return next(error);
        }

        res.redirect('/');
    });
};