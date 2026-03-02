import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await fetch(url);  
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch the requested URL.' });
    }

    const segments = await response.text();

    // Set the headers for HLS streaming
    res.setHeader('Content-Type', 'application/x-mpegURL');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS access
    res.setHeader('Cache-Control', 'no-cache'); // Prevent caching for live streams

    return res.status(200).send(segments);
  } catch (error) {
    console.error('Error fetching the URL:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}