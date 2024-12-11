import express from 'express';

const router = express.Router();

router.get('/', (req, res, next) => {
    if (!req.user)
        return res.render('auth');

    next();
}, (req, res) => {
    res.locals.filter = null;
    res.render('home', { user: req.user });
});

// router.get('/login', (req, res, next) => {
//     res.render('login', { user: req.user });
// });

export default router;
