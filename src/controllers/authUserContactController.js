import Chat from "../models/chatModel.js";

const phoneRegex = /(\+?[1-9][0-9\s\-]{6,14}[0-9])/; 
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/; 
const containsContactInfo = (message) => {
  return phoneRegex.test(message) || emailRegex.test(message);
};

const checkSessionsForContactInfo = async (req, res) => {
  const { chatbotId } = req.params;

  try {
    const sessions = await Chat.aggregate([
      { $match: { chatbot_id: chatbotId } },
      { $group: { _id: '$session_id', messages: { $push: '$user_message' } } },
    ]);

    const sessionsWithContactInfo = sessions.filter((session) => {
      return session.messages.some((message) => containsContactInfo(message));
    });

    if (sessionsWithContactInfo.length > 0) {
      return res.status(200).json({
        message: 'Sessions with contact info found',
        sessions: sessionsWithContactInfo,
      });
    } else {
      return res.status(200).json({
        message: 'No sessions with contact info found',
        sessions: [],
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error checking sessions' });
  }
};

export { checkSessionsForContactInfo };