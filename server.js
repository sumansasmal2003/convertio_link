const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const getFbVideoInfo = require('fb-downloader-scrapper');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/api/download-facebook-video', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }

    try {
        const result = await getFbVideoInfo(url);

        const downloadLink = result?.hd || result?.sd || null;

        if (!downloadLink) {
            return res.status(404).json({ error: 'No downloadable video found.' });
        }

        res.json({
            downloadLink,
            title: result.title,
            duration: result.duration,
            thumbnail: result.thumbnail
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ error: 'Failed to fetch video. Please check the URL and try again.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
