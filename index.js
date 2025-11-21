import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.5-flash';

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, and text files are allowed.'));
    }
  }
});

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
    try {
        if (!conversation || !Array.isArray(conversation)) throw new Error('Invalid conversation format');

        const contents = conversation.map(({role, text}) => ({
            role,
            parts: [{ text }],
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents
        });

        res.status(200).json({ result: response.text });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.post('/api/chat-with-files', upload.array('files', 5), async (req, res) => {
  try {
    const { message, conversation } = req.body;
    const files = req.files;

    if (!message && (!files || files.length === 0)) {
      return res.status(400).json({ error: 'Message or files are required' });
    }

    let conversationHistory = [];
    if (conversation) {
      try {
        conversationHistory = typeof conversation === 'string' 
          ? JSON.parse(conversation) 
          : conversation;
      } catch (e) {
        console.error('Failed to parse conversation:', e);
      }
    }

    const parts = [];

    if (message?.trim()) {
      parts.push({ text: message });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const fileData = await fs.readFile(file.path);
          const base64Data = fileData.toString('base64');

          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: base64Data
            }
          });

          await fs.unlink(file.path);
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
        }
      }
    }

    const contents = [];

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(({ role, text }) => {
        contents.push({
          role,
          parts: [{ text }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents
    });

    const resultText = response.text;

    res.status(200).json({ 
      result: resultText,
      filesProcessed: files ? files.length : 0
    });

  } catch (error) {
    console.error('Error in /api/chat-with-files:', error);
    
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }

    res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});