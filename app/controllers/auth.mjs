import bcrypt from 'bcryptjs';
import { findUserByID, authenticateLocal, authenticateGoogle, createUser, updateUser } from '../services/auth.mjs';

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

export const updateProfile = async (req, res) => {
    let { newName, newUsername, newPassword, oldPassword, newEmail } = req.body;

    newName = newName ? newName.trim() : undefined;
    newUsername = newUsername ? newUsername.trim() : undefined;
    newEmail = newEmail ? newEmail.trim() : undefined;

    // Set to undefined if length is 0 after trimming
    newName = newName && newName.length > 0 ? newName : undefined;
    newUsername = newUsername && newUsername.length > 0 ? newUsername : undefined;
    newEmail = newEmail && newEmail.length > 0 ? newEmail : undefined;

    const id = req.user.id;
    const user = await findUserByID(id);

    try {
        // If new password is provided, validate old password
        if (newPassword) {
            const match = user.password ? await bcrypt.compare(oldPassword || '', user.password) : !oldPassword;
            if (!match)
                return res.status(400).send('Old password is incorrect.');
        }

        const updatedData = {};
        if (newName && user.name !== newName)
            updatedData.name = newName;
        if (newUsername && user.username !== newUsername)
            updatedData.username = newUsername;
        if (newPassword)
            updatedData.password = newPassword;
        if (newEmail && user.email !== newEmail)
            updatedData.email = newEmail;

        // Update user information
        const result = await updateUser(id, updatedData);

        if (result.error)
            return res.status(400).send(result.error);

        req.user = { ...req.user, ...updatedData };
        req.login(req.user, (err) => {
            if (err) {
                return res.status(500).send('Error updating session.');
            }

            res.redirect('/');
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error updating profile.');
    }
};