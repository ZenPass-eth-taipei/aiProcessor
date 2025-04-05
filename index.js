require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Node.js backend!");
});

// Example API route
app.get("/api/data", (req, res) => {
  res.json({ message: "This is some data from the backend" });
});

// OpenAI Chat
app.post("/chat", async (req, res) => {
  // Input validation
  if (!req.body || !req.body.message) {
    return res.status(400).json({ 
      error: "Missing required field 'message' in request body" 
    });
  }

  const userMessage = req.body.message;

  // Validate OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: "OpenAI API key is not configured" 
    });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from OpenAI API");
    }

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ 
      error: "Error processing request",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
