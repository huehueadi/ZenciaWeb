import dotenv from 'dotenv';
import fs from 'fs/promises'; // Use promises directly
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Chat from '../models/chatModel.js';
import ScrapedData from '../models/scrappedDataModel.js';
import ChatbotModel from '../models/userModel.js';
import { generateResponse } from '../services/aiService.js';

dotenv.config();

const SESSION_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

const generateSessionId = () => `session-${uuidv4().split('-')[0]}`;

// Main chat handler
export const handleChat = async (req, res) => {
  const { message } = req.body;
  const { userid } = req.params;
  let session_id = req.headers['session-id'];

  if (!message || !userid) {
    return res.status(400).json({ error: 'Message and UUID are required' });
  }

  try {
    // Generate session ID if not provided
    session_id = session_id || generateSessionId();

    // Fetch user and validate in one go
    const user = await ChatbotModel.findOne({ userid }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    if (!user.isActiveTrial && user.payment === "No") {
      return res.status(400).json({
        message: "Trial expired or payment not done",
        success: false,
      });
    }

    // Fetch scraped data
    const scrapedDataRecord = await ScrapedData.findOne({ userid }).lean();
    if (!scrapedDataRecord || !scrapedDataRecord.fileUrl) {
      return res.status(404).json({ error: 'Scraped data not found' });
    }

    // Fetch and process file data
    const s3Data = await fetchDataFromLocalFile(scrapedDataRecord.fileUrl);
    if (!s3Data) {
      return res.status(400).json({ error: 'No valid scraped data found' });
    }

    // Fetch recent chat history (optimized with lean)
    const previousChats = await Chat.find({ session_id })
      .sort({ createdAt: 1 })
      .limit(5)
      .lean()
      .select('user_message bot_response');

    const chatHistory = previousChats
      .map(chat => `User: ${chat.user_message}\nBot: ${chat.bot_response}`)
      .join("\n\n");

    // Generate AI response
    const formattedPrompt = formatScrapedDataForAI(s3Data, message, chatHistory);
    const botResponse = await generateResponse(formattedPrompt);

    // Save chat log asynchronously (non-blocking)
    const chatLog = new Chat({
      user_message: message,
      bot_response: botResponse,
      chatbot_id: userid,
      session_id,
    });
    chatLog.save().catch(err => console.error('Chat log save error:', err));

    // Send response immediately
    res.json({ response: botResponse, session_id });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Format data for AI (optimized)
const formatScrapedDataForAI = (scrapedData, userQuery, chatHistory) => {
  const formattedText = Array.isArray(scrapedData) ? scrapedData.join("\n\n") : scrapedData;
  return `Summarized website data: ${formattedText}
Recent chat: ${chatHistory ? chatHistory.slice(-200) : 'None'}
User query: ${userQuery}
Generate response: `;
};

// Fetch data from local file (optimized)
export const fetchDataFromLocalFile = async (fileUrl) => {
  if (!fileUrl) throw new Error('fileUrl is undefined');

  try {
    const cleanFileUrl = fileUrl.startsWith('file://') ? fileUrl.slice(7) : fileUrl;
    const filePath = path.join(process.cwd(), 'src', 'scraped_files', cleanFileUrl);

    const fileData = await fs.readFile(filePath, 'utf-8');
    const scrapedData = JSON.parse(fileData);

    if (Array.isArray(scrapedData)) {
      const filteredData = scrapedData.flatMap(item => [
        ...(item.paragraphs?.filter(p => p.trim() && p !== "Test Mode") || []),
        ...(item.links?.filter(l => typeof l === 'string' && l.includes("http")) || []),
      ]);

      return filteredData.length ? filteredData.join("\n\n") : null;
    }
    return typeof scrapedData === 'object' ? JSON.stringify(scrapedData) : null;
  } catch (error) {
    console.error('File fetch error:', error.message);
    return null;
  }
};