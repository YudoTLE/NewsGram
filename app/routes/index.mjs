import express from 'express';

const router = express.Router();

router.get('/', (req, res, next) => {
    if (!req.user) {
        return res.render('home');
    }
    next();
}, (req, res) => {
    res.locals.filter = null;
    res.render('index', { user: req.user });
});

router.post('/', ensureLoggedIn(), (req, res, next) => {
    req.body.title = req.body.title.trim();
    next();
}, (req, res) => {
    if (req.body.title !== '')
        return res.redirect('/' + (req.body.filter || ''));
    return res.redirect('/' + (req.body.filter || ''));
});

export default router;
