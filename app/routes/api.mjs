import express from 'express';
import db from '../db.mjs';
import { ensureAuthenticated } from '../middleware/auth.mjs';

const router = express.Router();

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

router.post('/article', ensureAuthenticated, async (req, res) => {
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

        const shuffledArticles = articles.sort(() => Math.random() - 0.5);

        res.json(shuffledArticles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching news');
    }
});

export default router;
