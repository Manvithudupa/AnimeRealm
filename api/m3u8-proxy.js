// This is a sample implementation for the m3u8-proxy
// It should properly fetch and stream complete HLS manifests without truncation.

const express = require('express');
const request = require('request');

const app = express();

app.get('/api/m3u8-proxy', (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('No URL provided');
    }

    // Ensure complete HLS manifest is fetched
    const options = {
        url,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    // Stream the response
    request(options)
        .on('response', function (response) {
            res.writeHead(response.statusCode, response.headers);
            response.pipe(res);
        })
        .on('error', function (err) {
            console.error(err);
            res.status(500).send('Error fetching HLS manifest');
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;