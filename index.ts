
// Load environment variables from .env file
require('dotenv').config();

import * as express from "express";
import * as path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

// Check for API key on startup
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

// Initialize the Google AI client with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.render('index');
});

// Define a POST route to handle content generation
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use a recent, powerful model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Send the generated text back to the client
    res.json({ generatedText: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});


app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
