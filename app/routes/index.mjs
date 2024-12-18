import express from 'express';
import firestoreDB from '../db/firestore-db.mjs';
import { redirectUnauthenticated } from '../middleware/auth.mjs';
import { formatDate } from '../utils/date.mjs';

const router = express.Router();

router.get('/authenticate', (req, res) => {
    return res.render('auth');
});

router.get('/', redirectUnauthenticated, (req, res) => {
    res.render('home', { user: req.user });
});

router.get('/post-article', redirectUnauthenticated, (req, res) => {
    res.render('post-article', { user: req.user });
});

router.get('/article/:id', redirectUnauthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // const userRef = firestoreDB.collection('users').doc(user.id);
        // const userDoc = await userRef.get();

        // let visitedArticlesId = userDoc.data().visitedArticlesId || [];
        // if (visitedArticlesId.length === 0 || visitedArticlesId[visitedArticlesId.length - 1] !== id)
        //     visitedArticlesId.push(id);

        // await userRef.update({
        //     visitedArticlesId
        // });

        const articleDoc = await firestoreDB.collection('articles').doc(id).get();
        if (!articleDoc.exists)
            return res.status(404).json({ message: 'Article not found' });

        const article = {
            id: articleDoc.id,
            date: formatDate(articleDoc.data().createdAt),
            ...articleDoc.data()
        };
        
        res.render('article', { article });
    } catch(error) {
        console.error(`Error fetching articles: `, error);
        res.status(500).json({ error: `Internal server errror` });
    }
});

export default router;
