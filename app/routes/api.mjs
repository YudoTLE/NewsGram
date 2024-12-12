import express from 'express';
import axios from 'axios';
import firestoreDB from '../db/firestore-db.mjs';
import bucketDB from '../db/bucket-db.mjs';
import { ensureAuthenticated } from '../middleware/auth.mjs';
import { upload } from '../middleware/multer.mjs';

const router = express.Router();

router.get('/articles', async (req, res, next) => {
    try {
        const articlesQuery = await firestoreDB.collection('articles').get();

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
        const file = req.file;

        const blob = bucketDB.file(articleData);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype, // Set the MIME type of the file
            },
        });

        // Pipe the file buffer directly to Google Cloud Storage
        blobStream.on('finish', () => {
            const fileUrl = `https://storage.googleapis.com/${bucketDB.name}/${file.originalname}`;
            console.log('File uploaded to:', fileUrl);

            res.status(201).json({
                message: 'File uploaded successfully',
                fileUrl: fileUrl, // Return the file URL
            });
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).json({ error: 'Error uploading file' });
        });

        // Start the upload by ending the stream with the file buffer
        blobStream.end(file.buffer); // Directly use the file buffer from multer



        const articleRef = await firestoreDB.collection('articles').add({
            authorId: userId,
            category,
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
