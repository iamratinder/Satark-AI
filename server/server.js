const http = require('http');
const app = require('./app');
const axios = require('axios');
const dotenv = require('dotenv');
const port = process.env.PORT || 3000;

// Load environment variables (if not already loaded in app.js)
dotenv.config();

// Add proxy middleware to the existing Express app
app.post('/proxy/generate', async (req, res) => {
    try {
        const langflowApiUrl = process.env.LANGFLOW_API_URL;
        const astraToken = process.env.ASTRA_TOKEN;
        const response = await axios.post(
            `${langflowApiUrl}?stream=${req.query.stream || false}`,
            req.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${astraToken}`
                }
            }
        );

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error proxying request:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// Create and start the server
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Proxy endpoint available at http://localhost:${port}/proxy/generate`);
});