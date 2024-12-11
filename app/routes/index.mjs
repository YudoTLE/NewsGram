import express from 'express';
import db from '../db.mjs';
import { ensureLoggedIn } from 'connect-ensure-login';

const router = express.Router();

router.get('/', (req, res, next) => {
    if (!req.user)
        return res.render('auth');

    next();
}, (req, res) => {
    res.locals.filter = null;
    res.render('home', { user: req.user });
});

router.get('/articles', async (req, res, next) => {
    try {
        const articlesQuery = await db.collection('articles').get();

        const articles = articlesQuery.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(articles);
    } catch(error) {
        console.error(`Error fetching articles: `, error);
        res.status(500).json({ error: `Internal server errror` });
    }
});

router.get('/article/:id', ensureLoggedIn(), async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const userRef = db.collection('users').doc(user.id);
        const userDoc = await userRef.get();

        let visitedArticlesId = userDoc.data().visitedArticlesId || [];
        if (visitedArticlesId.length === 0 || visitedArticlesId[visitedArticlesId.length - 1] !== id)
            visitedArticlesId.push(id);

        await userRef.update({
            visitedArticlesId
        });

        const articleDoc = await db.collection('articles').doc(id).get();
        if (!articleDoc.exists)
            return res.status(404).json({ message: 'Article not found' });

        const article = {
            id: articleDoc.id,
            ...articleDoc.data()
        };
        res.status(200).json(article);
    } catch(error) {
        console.error(`Error fetching articles: `, error);
        res.status(500).json({ error: `Internal server errror` });
    }
});

router.post('/article', ensureLoggedIn(), async (req, res) => {
    try {
        const articleData = req.body;
        const userId = req.user.id;

        const articleRef = await db.collection('articles').add({
            authorId: userId,
            ...articleData,
            createdAt: new Date()
        });

        res.status(201).json({ message: 'Article created', id: articleRef.id });
    } catch (error) {
        console.error('Error creating article: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/newsapi', async (req, res) => {
    try {
        const axios = require('axios');
        const apiKey = 'MASUKIN NEWSAPI KEY DISINI';
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${ apiKey }`);
        const articles = response.data.articles;

        const randomArticles = articles.sort(() => 0.5 - Math.random()).slice(0, 20);
        res.json(randomArticles);
    } catch (error) {
        res.status(500).send('Error fetching news');
    }
});

export default router;
