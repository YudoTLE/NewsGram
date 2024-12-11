const redirectUnauthenticated = (req, res, next) => {
    if (!req.isAuthenticated())
        return res.redirect('/authenticate');

    next();
};

const ensureAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated())
        return res.status(401).json({ error: 'Unauthorized, please log in or sign in.' });
    
    next();
};

export { redirectUnauthenticated, ensureAuthenticated };