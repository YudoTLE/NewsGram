import express from 'express';
import db from '../db.mjs';
import { ensureLoggedIn } from 'connect-ensure-login';

const router = express.Router();

router.get('/articles', async (req, res, next) => {
    try {
        const articlesCollection = db.collection('articles');

        const articlesQuery = await articlesCollection.get();

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

router.get('/article/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const articlesCollection = db.collection('articles');

        const articleDoc = await articlesCollection.doc(id).get();

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
        const articlesCollection = db.collection('articles');

        const docRef = await articlesCollection.add({
            authorId: userId,
            ...articleData,
            createdAt: new Date()
        });

        res.status(201).json({ message: 'Article created', id: docRef.id });
    } catch (error) {
        console.error('Error creating article: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;