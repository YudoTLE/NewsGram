const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/news', async (req, res) => {
    try {
        const axios = require('axios');
        const apiKey = 'MASUKIN NEWSAPI KEY DISINI';
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${apiKey}`);
        const articles = response.data.articles;

        // Ambil 20 berita random
        const randomArticles = articles.sort(() => 0.5 - Math.random()).slice(0, 20);
        res.json(randomArticles);
    } catch (error) {
        res.status(500).send('Error fetching news');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
