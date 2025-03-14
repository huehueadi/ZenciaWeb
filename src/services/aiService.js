import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyCR8N0h-azK7GlfoMimJUg4vNlw0yA2juU'; // New API Key


export const generateResponse = async (message) => {
  console.time('generateResponse Time'); // Start timer
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      { contents: [{ role: 'user', parts: [{ text: message }] }] },
      { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY }, timeout: 100000 }
    );
    
    if (response.status === 200 && response.data.candidates && Array.isArray(response.data.candidates) && response.data.candidates.length > 0) {
      const botText = response.data.candidates[0].content.parts[0].text;
      console.timeEnd('generateResponse Time'); // End timer
      return botText; 
    } else {
      console.error("Invalid response from Gemini API:", response.data);
      throw new Error('Invalid or empty response from Gemini API');
    }
  } catch (err) {
    console.error('AI Service Error:', err.message);
    console.timeEnd('generateResponse Time'); // Ensure timer ends even on error
    return 'Sorry, I am unable to process your request at the moment.';
  }
};


export const generateResponseFromContext = async (message, context) => {
  try {
    const response = await generateGeminiResponse(message, context);
    return response;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Error generating response from AI model');
  }
};
