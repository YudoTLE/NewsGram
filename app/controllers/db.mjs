import axios from 'axios';
import { createArticle } from '../services/db.mjs';

export const postArticle = async (req, res) => {
    try {
        const articleData = req.body;
        articleData.authorId = req.user.id;
        articleData.category = (await axios.post(
            'https://category-prediction-886051640307.asia-southeast2.run.app/predict-category',
            { "headline": articleData.title }
        )).data.category;
        articleData.img = req.file;

        await createArticle(articleData);

        res.redirect('/');
    } catch (error) {
        console.error('Error creating article: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};