const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const urlDatabase = {}; // In-memory storage for original and shortened URLs

app.post('/api/shorten-url', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }

    const id = shortid.generate();
    const shortenedUrl = `http://localhost:5000/${id}`; // Change this URL based on your deployment
    urlDatabase[id] = url;

    res.json({ shortenedUrl });
});

app.get('/:id', (req, res) => {
    const originalUrl = urlDatabase[req.params.id];

    if (originalUrl) {
        res.redirect(originalUrl);
    } else {
        res.status(404).json({ error: 'URL not found.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
