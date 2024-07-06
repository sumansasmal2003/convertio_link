const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Route to fetch video information
app.post('/api/fetchInfo', async (req, res) => {
    const { url } = req.body;

    try {
        if (!url) {
            return res.status(400).json({ error: 'Missing YouTube video URL' });
        }

        const info = await ytdl.getInfo(url);

        res.json({ videoInfo: { title: info.videoDetails.title, thumbnail: info.videoDetails.thumbnails[0].url } });

    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ error: 'Failed to fetch video information' });
    }
});

// Route to fetch audio information
app.post('/api/fetchAudioInfo', async (req, res) => {
    const { url } = req.body;

    try {
        if (!url) {
            return res.status(400).json({ error: 'Missing YouTube video URL' });
        }

        const info = await ytdl.getInfo(url);

        res.json({ audioInfo: { title: info.videoDetails.title, thumbnail: info.videoDetails.thumbnails[0].url } });

    } catch (error) {
        console.error('Error fetching audio info:', error);
        res.status(500).json({ error: 'Failed to fetch audio information' });
    }
});


// Route to download video
app.post('/api/download', async (req, res) => {
    const { url, quality, videoInfo } = req.body;

    try {
        if (!url || !videoInfo) {
            return res.status(400).json({ error: 'Missing video URL or video information' });
        }

        const videoTitle = videoInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
        const videoPath = path.join(__dirname, `videos/${videoTitle}.mp4`);

        const videoStream = ytdl(url, { quality: quality || 'highest' });

        videoStream.on('error', (err) => {
            console.error('Error downloading video:', err);
            res.status(500).json({ error: 'Failed to download video' });
        });

        const writeStream = fs.createWriteStream(videoPath);

        writeStream.on('finish', () => {
            // Serve the video file
            res.json({ downloadLink: `http://localhost:${PORT}/videos/${videoTitle}.mp4` });
        });

        videoStream.pipe(writeStream);

    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: 'Failed to download video' });
    }
});

// Route to download audio
app.post('/api/downloadAudio', async (req, res) => {
    const { url, audioInfo } = req.body;

    try {
        if (!url || !audioInfo) {
            return res.status(400).json({ error: 'Missing video URL or audio information' });
        }

        const audioTitle = audioInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
        const audioPath = path.join(__dirname, `audios/${audioTitle}.mp3`);

        const audioStream = ytdl(url, { filter: 'audioonly' });

        audioStream.on('error', (err) => {
            console.error('Error downloading audio:', err);
            res.status(500).json({ error: 'Failed to download audio' });
        });

        const writeStream = fs.createWriteStream(audioPath);

        writeStream.on('finish', () => {
            // Serve the audio file
            res.json({ downloadLink: `http://localhost:${PORT}/audios/${audioTitle}.mp3` });
        });

        audioStream.pipe(writeStream);

    } catch (error) {
        console.error('Error downloading audio:', error);
        res.status(500).json({ error: 'Failed to download audio' });
    }
});

// Route to delete video after download
app.post('/api/deleteVideo', async (req, res) => {
    const { videoUrl } = req.body;

    try {
        if (!videoUrl) {
            return res.status(400).json({ error: 'Missing video URL' });
        }

        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_');
        const videoPath = path.join(__dirname, `videos/${videoTitle}.mp4`);

        // Delete the video file from the server
        fs.unlinkSync(videoPath);

        res.json({ message: 'Video file deleted from server' });

    } catch (error) {
        console.error('Error deleting video file:', error);
        res.status(500).json({ error: 'Failed to delete video file from server' });
    }
});

// Route to delete audio after download
app.post('/api/deleteAudio', async (req, res) => {
    const { videoUrl } = req.body;

    try {
        if (!videoUrl) {
            return res.status(400).json({ error: 'Missing video URL' });
        }

        const audioInfo = await ytdl.getInfo(videoUrl);
        const audioTitle = audioInfo.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_');
        const audioPath = path.join(__dirname, `audios/${audioTitle}.mp3`);

        // Delete the audio file from the server
        fs.unlinkSync(audioPath);

        res.json({ message: 'Audio file deleted from server' });

    } catch (error) {
        console.error('Error deleting audio file:', error);
        res.status(500).json({ error: 'Failed to delete audio file from server' });
    }
});

// Serve static files (e.g., downloaded audio)
app.use('/audios', express.static(path.join(__dirname, 'audios')));

// Serve static files (e.g., downloaded videos)
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
