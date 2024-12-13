import express from 'express';
import firestoreDB from '../db/firestore-db.mjs';
import bucketDB from '../db/bucket-db.mjs';
import { ensureAuthenticated } from '../middleware/auth.mjs';
import { upload } from '../middleware/multer.mjs';
import { postArticle } from '../controllers/db.mjs';

const router = express.Router();

router.get('/articles', async (req, res) => {
    try {
        const { category, limit='100' } = req.query;
        
        let articlesQuery = firestoreDB.collection('articles');
        if (category) {
            articlesQuery = articlesQuery
                .where('category', '==', category);
        }
        if (limit) {
            articlesQuery = articlesQuery
                .limit(parseInt(limit, 10));
        }
        articlesQuery = await articlesQuery.get();

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

router.post('/article', ensureAuthenticated, upload.single('article-img'), postArticle);

export default router;