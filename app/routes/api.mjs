import express from 'express';
import axios from 'axios';
import firestoreDB from '../db/firestore-db.mjs';
import bucketDB from '../db/bucket-db.mjs';
import { ensureAuthenticated } from '../middleware/auth.mjs';
import { upload } from '../middleware/multer.mjs';

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

router.post('/article', upload.single('article-img'), async (req, res) => {
    try {
        const articleData = req.body;
        const userId = req.user.id;
        const category = (await axios.post('https://category-prediction-886051640307.asia-southeast2.run.app/predict-category',
            { "headline": articleData.title }
        )).data.category;
        const img = req.file;

        const articleRef = await firestoreDB.collection('articles').add({
            authorId: userId,
            category,
            ...articleData,
            createdAt: new Date()
        });

        if (img) {
            const blob = bucketDB.file(articleRef.id);
            const blobStream = blob.createWriteStream({
                resumable: false,
                metadata: {
                    contentType: img.mimetype,
                },
            });
            blobStream.on('finish', async () => {
                const imgUrl = `https://storage.googleapis.com/${ bucketDB.name }/${ articleRef.id }`;

                articleRef.update({
                    imgUrl
                });
            });
            blobStream.end(img.buffer);
        }

        res.redirect('/');
    } catch (error) {
        console.error('Error creating article: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;