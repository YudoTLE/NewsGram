import bcrypt from 'bcryptjs';
import firestoreDB from '../db/firestore-db.mjs';

export const findUserByIdentifier = async (identifier) => {
    if (!identifier) return undefined;

    const [userByUsername, userByEmail] = await Promise.all([
        findUserByUsername(identifier),
        findUserByEmail(identifier),
    ]);

    return userByUsername || userByEmail || undefined;
};

export const findUserByUsername = async (username) => {
    if (!username)
        return undefined;

    const userRef = await firestoreDB.collection('users')
        .where('username', '==', username)
        .get();
    if (!userRef.empty)
        return userRef.docs[0].data();

    return undefined;
};

export const findUserByEmail = async (email) => {
    if (!email)
        return undefined;

    const userRef = await firestoreDB.collection('users')
        .where('email', '==', email)
        .get();
    if (!userRef.empty)
        return userRef.docs[0].data();
    
    return undefined;
};

export const createUser = async (userData) => {
    const { name, username, password, email, photo } = userData;

    if (!((username && password) || email))
        return { error: 'Insufficient data.' };

    if (await findUserByUsername(username))
        return { error: 'Username already in use.' };
    if (await findUserByEmail(email))
        return { error: 'Email already in use.' };
    
    const newUser = { createdAt: new Date() };
    if (name) newUser.name = name;
    if (username) newUser.username = username;
    if (password) newUser.password = await bcrypt.hash(password, 10);
    if (email) newUser.email = email;
    if (photo) newUser.photo = photo;

    const newUserRef = await firestoreDB.collection('users').add(newUser);
    newUser.id = newUserRef.id;

    return newUser;
};

export const authenticateLocal = async (identifier, password) => {
    const user = await findUserByIdentifier(identifier);
    if (!user)
        return { error: 'Incorrect email or username.' };

    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return { error: 'Incorrect password.' };

    return user;
};

export const authenticateGoogle = async (profile) => {
    const email = profile.emails[0].value;
    const photo = profile.photos[0].value;
    if (!email)
        return { error: 'Google account does not have an email address associated.' };

    let user = await findUserByEmail(email);
    if (!user) {
        user = await createUser({ email, photo });
    } else {
        user = {
            photo,
            ...user
        };
    }

    return user;
};
